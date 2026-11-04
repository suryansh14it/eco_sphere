import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import NGOLocalInitiative from '@/models/NgoFundRequest';
import { requireRole } from '@/lib/session';
import { membersForProjects, ngoIdentity } from '@/lib/project-service';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['ngo']);
    if (!auth.user) return auth.response;
    const user = auth.user;

    const data = await req.json().catch(() => ({}));

    // ---- Fund-request gate: must point at an existing volunteer project ----
    const projectId = String(data.projectId || '');
    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json(
        { success: false, message: 'Select the volunteer project you are asking funds for.' },
        { status: 400 }
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'That volunteer project no longer exists.' },
        { status: 404 }
      );
    }
    if (project.ngo.id !== String(user._id)) {
      return NextResponse.json(
        { success: false, message: 'You can only request funds for a project your organisation started.' },
        { status: 403 }
      );
    }

    // Community backing: at least one volunteer must have joined already.
    const joinedVolunteers = (await membersForProjects([projectId]))[projectId] || [];
    if (joinedVolunteers.length < 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            'No volunteers have joined this project yet. Post it to the volunteer board and get community sign-ups before asking the government for funds.',
        },
        { status: 400 }
      );
    }

    // Session is the only source of NGO identity.
    const ngo = ngoIdentity(user);

    // Required funding-details fields from the form.
    const projectFunding = String(data.projectFunding || '').trim();
    const timeline = String(data.timeline || '').trim();
    const department = String(data.department || '').trim();
    const ngoCommission = String(data.ngoCommission || '').trim();
    const proposalSummary = String(data.proposalSummary || '').trim();
    const upiId = String(data.upiId || '').trim();
    // Basic VPA shape: local@handle (e.g..probetrust@upi / name@okaxis).
    const upiOk = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId);
    if (
      !projectFunding || !timeline || !department || !ngoCommission ||
      !proposalSummary || !upiOk
    ) {
      return NextResponse.json(
        {
          success: false,
          message: !upiOk
            ? 'Enter a valid UPI ID (e.g. yourorg@upi) so the government can pay you directly.'
            : 'Funding amount, timeline, department, NGO commission and proposal summary are all required.',
        },
        { status: 400 }
      );
    }

    const initiative = new NGOLocalInitiative({
      // Volunteer project linkage + community evidence
      projectId,
      projectTitle: project.title,
      projectLocation: [
        project.location?.address,
        project.location?.district,
        project.location?.state,
      ]
        .filter(Boolean)
        .join(', '),
      volunteerCount: joinedVolunteers.length,
      volunteers: joinedVolunteers.map((m) => ({
        id: m.userId,
        name: m.name,
        email: m.email,
        roleTitle: m.roleTitle || 'Volunteer',
        joinedAt: m.joinedAt,
      })),

      // Basic project info (title/description/location come from the project)
      title: project.title,
      description: String(data.description || project.description || ''),
      location: project.location?.address || 'Not specified',
      projectFunding,
      timeline,

      // NGO info from the session
      ngoId: ngo.id,
      ngoName: ngo.name,
      ngoEmail: ngo.email,
      ngoCommission,
      upiId,

      // Government submission details
      department,
      proposalSummary,

      // Project details
      expectedImpact: String(data.expectedImpact || ''),
      implementationPlan: String(data.implementationPlan || ''),
      expectedStartDate: String(data.expectedStartDate || ''),
      teamSize: String(data.teamSize || ''),
      experienceLevel: String(data.experienceLevel || ''),
      additionalNotes: String(data.additionalNotes || ''),

      // Categories and goals
      categories: Array.isArray(data.categories) ? data.categories : [],
      sdgGoals: Array.isArray(data.sdgGoals) ? data.sdgGoals : [],

      // Key metrics
      keyMetrics: {
        volunteers: String((data.keyMetrics || {}).volunteers || ''),
        beneficiaries: String((data.keyMetrics || {}).beneficiaries || ''),
        areaImpact: String((data.keyMetrics || {}).areaImpact || ''),
        carbonReduction: String((data.keyMetrics || {}).carbonReduction || ''),
      },

      submittedAt: new Date(),
      status: 'submitted',
    });

    const savedInitiative = await initiative.save();

    return NextResponse.json({
      success: true,
      message: 'Funding request submitted to the government.',
      initiativeId: savedInitiative._id,
      volunteerCount: joinedVolunteers.length,
    });
  } catch (error: any) {
    console.error('Error submitting funding request:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to submit the funding request',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const ngoId = searchParams.get('ngoId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const query = ngoId ? { ngoId } : {};

    const initiatives = await NGOLocalInitiative.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      initiatives,
    });
  } catch (error: any) {
    console.error('Error fetching local initiatives:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch initiatives' },
      { status: 500 }
    );
  }
}

/**
 * NGO-side housekeeping on its own requests. Today only one action exists:
 * marking a payment-received notice as seen so the dashboard toast and the
 * volunteer-board badge stop announcing it on every visit.
 */
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['ngo']);
    if (!auth.user) return auth.response;

    const { id } = await req.json().catch(() => ({}));
    if (!mongoose.isValidObjectId(String(id || ''))) {
      return NextResponse.json({ success: false, message: 'Unknown request.' }, { status: 400 });
    }

    const initiative = await NGOLocalInitiative.findById(id);
    if (!initiative || initiative.ngoId !== String(auth.user._id)) {
      return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 });
    }

    initiative.ngoSeenPaymentAt = new Date();
    await initiative.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating local initiative:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Could not update the request.' },
      { status: 500 }
    );
  }
}
