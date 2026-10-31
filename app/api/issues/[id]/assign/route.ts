import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import IssueUpdate from '@/models/IssueUpdate';
import { requireUser } from '@/lib/session';

/**
 * Role actions on an issue:
 * - `adopt`   (NGO)  take ownership of a verified issue
 * - `triage`  (Gov)  acknowledge and route it to a department
 * - `escalate`(Gov)  flag it for urgent attention
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = await requireUser(req);
    if (!auth.user) return auth.response;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Issue not found.' }, { status: 404 });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ success: false, message: 'Issue not found.' }, { status: 404 });
    }

    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || '');

    if (['resolved', 'rejected'].includes(issue.status)) {
      return NextResponse.json(
        { success: false, message: 'This issue is already closed.' },
        { status: 409 }
      );
    }

    if (action === 'adopt') {
      if (auth.user.role !== 'ngo') {
        return NextResponse.json(
          { success: false, message: 'Only NGOs can adopt an issue.' },
          { status: 403 }
        );
      }

      issue.assignedNgo = {
        id: String(auth.user._id),
        name: auth.user.organizationName || auth.user.name,
        email: auth.user.email,
      };

      if (['reported', 'verified', 'triaged'].includes(issue.status)) {
        issue.status = 'assigned';
      }

      await issue.save();

      await IssueUpdate.create({
        issueId: issue._id,
        author: { id: String(auth.user._id), name: auth.user.name, role: auth.user.role },
        type: 'adoption',
        body: `${issue.assignedNgo.name} has taken up this issue.`,
        toStatus: issue.status,
      });

      return NextResponse.json({ success: true, issue, message: 'You are now handling this issue.' });
    }

    if (auth.user.role !== 'government') {
      return NextResponse.json(
        { success: false, message: 'Only government officials can do that.' },
        { status: 403 }
      );
    }

    if (action === 'triage') {
      const department = String(payload.department || auth.user.department || '').trim();

      issue.assignedDepartment = department || issue.assignedDepartment;
      issue.assignedOfficial = { id: String(auth.user._id), name: auth.user.name };
      if (!issue.acknowledgedAt) issue.acknowledgedAt = new Date();
      if (['reported', 'verified'].includes(issue.status)) issue.status = 'triaged';

      await issue.save();

      await IssueUpdate.create({
        issueId: issue._id,
        author: { id: String(auth.user._id), name: auth.user.name, role: auth.user.role },
        type: 'status_change',
        body: `Acknowledged by ${auth.user.name}${department ? ` and routed to the ${department} department` : ''}.`,
        toStatus: issue.status,
      });

      return NextResponse.json({ success: true, issue, message: 'Issue acknowledged and routed.' });
    }

    if (action === 'escalate') {
      issue.escalated = true;
      await issue.save();

      await IssueUpdate.create({
        issueId: issue._id,
        author: { id: String(auth.user._id), name: auth.user.name, role: auth.user.role },
        type: 'escalation',
        body: String(payload.body || 'This issue has been escalated for urgent attention.'),
      });

      return NextResponse.json({ success: true, issue, message: 'Issue escalated.' });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating issue assignment:', error);
    return NextResponse.json(
      { success: false, message: 'Could not update this issue.' },
      { status: 500 }
    );
  }
}
