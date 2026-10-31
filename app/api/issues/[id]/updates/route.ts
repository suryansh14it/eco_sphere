import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Issue, { ISSUE_STATUSES } from '@/models/Issue';
import IssueUpdate from '@/models/IssueUpdate';
import { requireUser } from '@/lib/session';

const GOVERNMENT_STATUSES = ['triaged', 'assigned', 'in_progress', 'resolved', 'rejected'];
const NGO_STATUSES = ['in_progress', 'resolved'];

/**
 * Adds a comment, an official response, or a status change to an issue.
 * Permissions are enforced here - the UI only decides what to show.
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
    const type = String(payload.type || 'comment');
    const text = String(payload.body || '').trim();
    const toStatus = payload.toStatus ? String(payload.toStatus) : '';

    if (!['comment', 'status_change', 'official_response'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid update type.' }, { status: 400 });
    }

    if (type === 'official_response' && auth.user.role !== 'government') {
      return NextResponse.json(
        { success: false, message: 'Only government officials can post an official response.' },
        { status: 403 }
      );
    }

    let fromStatus: string | undefined;

    if (type === 'status_change') {
      if (!(ISSUE_STATUSES as readonly string[]).includes(toStatus)) {
        return NextResponse.json({ success: false, message: 'Invalid status.' }, { status: 400 });
      }

      const isGovernment = auth.user.role === 'government';
      const isAssignedNgo =
        auth.user.role === 'ngo' && issue.assignedNgo?.id === String(auth.user._id);

      if (!isGovernment && !isAssignedNgo) {
        return NextResponse.json(
          { success: false, message: 'Only the government or the assigned NGO can change the status.' },
          { status: 403 }
        );
      }

      const allowed = isGovernment ? GOVERNMENT_STATUSES : NGO_STATUSES;
      if (!allowed.includes(toStatus)) {
        return NextResponse.json(
          { success: false, message: `You cannot move this issue to "${toStatus}".` },
          { status: 403 }
        );
      }

      if (['resolved', 'rejected'].includes(issue.status) && !isGovernment) {
        return NextResponse.json(
          { success: false, message: 'This issue is closed. Only the government can reopen it.' },
          { status: 403 }
        );
      }

      fromStatus = issue.status;
      issue.status = toStatus as any;

      if (toStatus === 'triaged' && !issue.acknowledgedAt) issue.acknowledgedAt = new Date();
      if (toStatus === 'resolved') issue.resolvedAt = new Date();
      if (toStatus !== 'resolved') issue.resolvedAt = undefined;
      if (toStatus === 'rejected') issue.escalated = false;

      await issue.save();
    }

    if (type !== 'status_change' && !text) {
      return NextResponse.json({ success: false, message: 'Please write a message.' }, { status: 400 });
    }

    const update = await IssueUpdate.create({
      issueId: issue._id,
      author: { id: String(auth.user._id), name: auth.user.name, role: auth.user.role },
      type,
      body:
        text ||
        `Status changed from ${fromStatus} to ${toStatus}.`,
      fromStatus,
      toStatus: type === 'status_change' ? toStatus : undefined,
    });

    return NextResponse.json({ success: true, update, issue });
  } catch (error: any) {
    console.error('Error adding issue update:', error);
    return NextResponse.json(
      { success: false, message: 'Could not post your update.' },
      { status: 500 }
    );
  }
}
