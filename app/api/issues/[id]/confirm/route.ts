import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import IssueUpdate from '@/models/IssueUpdate';
import { requireUser } from '@/lib/session';

const VALID_TYPES = ['confirm', 'still_happening', 'fixed'];

/**
 * Community verification signal: "I see this too", "still happening", "fixed".
 * Enough confirmations move a report from `reported` to `verified`.
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
    const type = String(payload.type || 'confirm');

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid confirmation type.' }, { status: 400 });
    }

    const userId = String(auth.user._id);
    const already = issue.confirmations.some(
      (confirmation) => confirmation.userId === userId && confirmation.type === type
    );

    if (already) {
      return NextResponse.json(
        { success: false, message: 'You have already added this confirmation.' },
        { status: 409 }
      );
    }

    issue.confirmations.push({
      userId,
      name: auth.user.name,
      type: type as any,
      createdAt: new Date(),
    });

    if (type === 'confirm') issue.confirmCount += 1;
    if (type === 'still_happening') issue.stillHappeningCount += 1;
    if (type === 'fixed') issue.fixedCount += 1;

    let promoted = false;
    if (type === 'confirm' && issue.status === 'reported' && issue.confirmCount >= 3) {
      issue.status = 'verified';
      promoted = true;
    }

    await issue.save();

    const labels: Record<string, string> = {
      confirm: 'confirmed seeing this issue',
      still_happening: 'reported that this issue is still happening',
      fixed: 'reported that this issue looks fixed',
    };

    await IssueUpdate.create({
      issueId: issue._id,
      author: { id: userId, name: auth.user.name, role: auth.user.role },
      type: 'verification',
      body: `${auth.user.name} ${labels[type]}.`,
      ...(promoted ? { fromStatus: 'reported', toStatus: 'verified' } : {}),
    });

    if (promoted) {
      await IssueUpdate.create({
        issueId: issue._id,
        author: { id: 'system', name: 'EcoSphere', role: 'system' },
        type: 'status_change',
        body: 'This issue was verified by the community and is now visible to authorities.',
        fromStatus: 'reported',
        toStatus: 'verified',
      });
    }

    if (type === 'fixed' && issue.fixedCount >= 3 && ['assigned', 'in_progress'].includes(issue.status)) {
      await IssueUpdate.create({
        issueId: issue._id,
        author: { id: 'system', name: 'EcoSphere', role: 'system' },
        type: 'verification',
        body: 'Multiple citizens report this issue is fixed. Waiting for the responsible authority or NGO to close it.',
      });
    }

    await auth.user.addXP(2, {
      eventType: 'issue_reported',
      description: `Verified: ${issue.title}`,
      relatedItemId: `issue-${issue._id}-${type}`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      issue,
      promoted,
      xpAwarded: 2,
      message: promoted
        ? 'Thanks! Your confirmation helped verify this issue.'
        : 'Thanks for adding your confirmation.',
    });
  } catch (error: any) {
    console.error('Error confirming issue:', error);
    return NextResponse.json(
      { success: false, message: 'Could not record your confirmation.' },
      { status: 500 }
    );
  }
}
