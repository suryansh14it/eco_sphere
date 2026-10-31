import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { createIssueFromReport } from '@/lib/issue-service';
import { requireUser } from '@/lib/session';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Public issue feed. Anyone can read it - no login required.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const q = (searchParams.get('q') || '').trim();
    const sort = searchParams.get('sort') || 'newest';
    const mine = searchParams.get('mine') === '1';
    const adopted = searchParams.get('adopted') === '1';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);

    const query: Record<string, any> = {};

    if (statusParam) {
      query.status = { $in: statusParam.split(',').filter(Boolean) };
    } else {
      query.status = { $ne: 'duplicate' };
    }

    if (category) query.category = category;

    if (q) {
      const safe = new RegExp(escapeRegex(q), 'i');
      query.$or = [{ title: safe }, { description: safe }, { 'location.address': safe }];
    }

    if (mine || adopted) {
      const auth = await requireUser(req);
      if (!auth.user) return auth.response;
      if (mine) query['reporter.id'] = String(auth.user._id);
      if (adopted) query['assignedNgo.id'] = String(auth.user._id);
    }

    const sortSpec: Record<string, 1 | -1> =
      sort === 'confirmed'
        ? { confirmCount: -1, createdAt: -1 }
        : sort === 'severity'
          ? { severity: -1, createdAt: -1 }
          : { createdAt: -1 };

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .select('-media -confirmations')
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Issue.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      issues,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { success: false, message: 'Could not load issues.' },
      { status: 500 }
    );
  }
}

/**
 * Create a report. The reporter is taken from the signed session cookie -
 * never from the request body.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireUser(req);
    if (!auth.user) return auth.response;

    const formData = await req.formData();
    const result = await createIssueFromReport({ user: auth.user, formData });

    const issueId = String(result.issue._id);

    return NextResponse.json(
      {
        success: true,
        duplicate: result.duplicate,
        issueId,
        issueUrl: `/issues/${issueId}`,
        issue: {
          id: issueId,
          title: result.issue.title,
          status: result.issue.status,
          severity: result.issue.severity,
          category: result.issue.category,
          location: result.issue.location?.address,
          confirmCount: result.issue.confirmCount,
        },
        validation: result.validation,
        xpAwarded: result.xpAwarded,
        newLevel: auth.user.level,
        message: result.duplicate
          ? 'This matches an existing report nearby, so we added your confirmation to it.'
          : 'Thank you! Your report is now on the public issue board.',
      },
      { status: result.duplicate ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('Error creating issue:', error);
    const status = typeof error?.status === 'number' ? error.status : 500;
    return NextResponse.json(
      { success: false, message: error?.message || 'Could not submit your report.' },
      { status }
    );
  }
}
