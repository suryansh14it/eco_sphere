import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { createIssueFromReport } from '@/lib/issue-service';
import { requireUser } from '@/lib/session';

/**
 * Legacy endpoint kept for backwards compatibility.
 * New clients should POST to /api/issues.
 *
 * Reports are now persisted as `Issue` documents instead of being discarded
 * after AI validation.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireUser(req);
    if (!auth.user) return auth.response;

    const formData = await req.formData();
    const result = await createIssueFromReport({ user: auth.user, formData });

    return NextResponse.json({
      success: true,
      duplicate: result.duplicate,
      issueId: String(result.issue._id),
      issueUrl: `/issues/${result.issue._id}`,
      validation: result.validation,
      xpAwarded: result.xpAwarded,
      newLevel: auth.user.level,
      message: result.duplicate
        ? 'This matches an existing report nearby, so we added your confirmation to it.'
        : 'Thank you for your environmental report! It is now on the public issue board.',
    });
  } catch (error: any) {
    console.error('Error submitting environmental issue:', error);
    const status = typeof error?.status === 'number' ? error.status : 500;
    return NextResponse.json(
      { success: false, message: error?.message || 'Error processing your report. Please try again.' },
      { status }
    );
  }
}
