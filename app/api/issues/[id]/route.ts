import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import IssueUpdate from '@/models/IssueUpdate';

/**
 * Public issue detail. Includes the full timeline of status changes and
 * comments so every stakeholder sees the same history.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Issue not found.' },
        { status: 404 }
      );
    }

    const issue = await Issue.findById(id).lean();
    if (!issue) {
      return NextResponse.json(
        { success: false, message: 'Issue not found.' },
        { status: 404 }
      );
    }

    const updates = await IssueUpdate.find({ issueId: id })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return NextResponse.json({ success: true, issue, updates });
  } catch (error: any) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { success: false, message: 'Could not load this issue.' },
      { status: 500 }
    );
  }
}
