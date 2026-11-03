import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import NGOLocalInitiative from '@/models/NgoFundRequest';
import Project from '@/models/Project';
import ManagedProject from '@/models/ManagedProject';
import { requireRole } from '@/lib/session';

/**
 * Government review of NGO funding requests.
 *
 * GET     -> every request plus what you need to show it: the linked volunteer
 *            project's live status/progress and its management media/documents
 *            (photos and documentation the NGO added).
 * POST    -> decision actions:
 *            approve  { id, approvedFunding, note } confirm the request
 *            payment  { id, ref }                   release the payment
 *            reject   { id, note }                  close a request
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['government']);
    if (!auth.user) return auth.response;

    const requests = await NGOLocalInitiative.find({}).sort({ submittedAt: -1 }).lean();

    // Linked volunteer projects: live status, progress and work evidence.
    const projectIds = requests.map((r) => r.projectId).filter((id) => mongoose.isValidObjectId(id));
    const [projects, workspaces] = await Promise.all([
      projectIds.length
        ? (Project.find({ _id: { $in: projectIds } })
            .select('title status')
            .lean()) as any[]
        : Promise.resolve([]),
      projectIds.length
        ? (ManagedProject.find({ key: { $in: projectIds.map((id) => `volunteer-${id}`) } })
            .select('key progress completedAt completedSummary media documents notices removedUserIds')
            .lean()) as any[]
        : Promise.resolve([]),
    ]);
    const projectById = new Map(projects.map((p) => [String(p._id), p]));
    const workspaceByKey = new Map(workspaces.map((w) => [w.key, w]));

    const enriched = requests.map((r) => {
      const projectId = r.projectId || '';
      const project = projectById.get(projectId);
      const workspace = workspaceByKey.get(`volunteer-${projectId}`);
      const media = (workspace?.media || []).filter((m: any) => m.kind === 'image');
      return {
        ...r,
        project: project
          ? {
              id: projectId,
              status: project.status,
              progress: workspace?.progress ?? 0,
              completedAt: project.status === 'completed' ? workspace?.completedAt || null : null,
              completedSummary: workspace?.completedSummary || '',
            }
          : null,
        workEvidence: {
          media,
          documents: workspace?.documents || [],
          notices: workspace?.notices || [],
          mediaCount: (workspace?.media || []).length,
          documentCount: (workspace?.documents || []).length,
        },
      };
    });

    return NextResponse.json({ success: true, requests: enriched });
  } catch (error: any) {
    console.error('government funding-requests GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Could not load funding requests.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['government']);
    if (!auth.user) return auth.response;
    const gov = auth.user;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const id = String(body.id || '');
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Unknown request.' }, { status: 400 });
    }

    const request = await NGOLocalInitiative.findById(id);
    if (!request) {
      return NextResponse.json({ success: false, message: 'Funding request not found.' }, { status: 404 });
    }

    switch (action) {
      // ---- government confirms the request (payment still pending) ----
      case 'approve': {
        if (request.status !== 'submitted') {
          return NextResponse.json(
            { success: false, message: 'Only requests awaiting confirmation can be approved.' },
            { status: 409 }
          );
        }
        const approvedFunding = String(body.approvedFunding || '').trim();
        if (!approvedFunding) {
          return NextResponse.json(
            { success: false, message: 'Enter the approved funding amount.' },
            { status: 400 }
          );
        }
        request.status = 'approved';
        request.approvedFunding = approvedFunding;
        request.approvedNote = String(body.note || '').trim();
        request.approvedByGov = { id: String(gov._id), name: gov.name };
        request.approvedAt = new Date();
        request.paymentStatus = 'pending';
        await request.save();
        return NextResponse.json({
          success: true,
          message: `Request approved for ${request.ngoName}. Payment is now pending release.`,
        });
      }

      // ---- payment released ----
      case 'payment': {
        if (request.status !== 'approved') {
          return NextResponse.json(
            { success: false, message: 'Approve the request before releasing payment.' },
            { status: 409 }
          );
        }
        request.status = 'funded';
        request.paymentStatus = 'completed';
        request.paymentRef = String(body.ref || '').trim();
        request.fundedAt = new Date();
        await request.save();
        return NextResponse.json({
          success: true,
          message: `Payment marked complete for "${request.title}". It now shows under Approved Projects.`,
        });
      }

      // ---- reject a pending request ----
      case 'reject': {
        if (request.status !== 'submitted') {
          return NextResponse.json(
            { success: false, message: 'Only requests awaiting confirmation can be rejected.' },
            { status: 409 }
          );
        }
        request.approvedNote = String(body.note || 'Request rejected by the government.');
        request.approvedByGov = { id: String(gov._id), name: gov.name };
        request.approvedAt = new Date();
        await request.save();
        return NextResponse.json({ success: true, message: 'Request marked as rejected in its review notes.' });
      }

      default:
        return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('government funding-requests POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Action failed.' },
      { status: 500 }
    );
  }
}
