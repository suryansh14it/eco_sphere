import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectMember from '@/models/ProjectMember';
import { requireUser, requireRole } from '@/lib/session';
import {
  isReferralValid,
  isValidCategory,
  isValidObjectIdList,
  ngoIdentity,
  normalizeRoles,
  roleCountsForProjects,
  serializeProject,
} from '@/lib/project-service';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Public project board. Anyone can read it - no login required.
 * `mine=1` (owning NGO) and `joined=1` (volunteer) narrow to the session user.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const q = (searchParams.get('q') || '').trim();
    const mine = searchParams.get('mine') === '1';
    const joined = searchParams.get('joined') === '1';
    const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10) || 60, 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);

    const query: Record<string, any> = {};

    if (status) query.status = { $in: status.split(',').filter(Boolean) };

    if (category) query.category = category;

    if (q) {
      const safe = new RegExp(escapeRegex(q), 'i');
      query.$or = [{ title: safe }, { description: safe }, { 'location.address': safe }];
    }

    if (mine || joined) {
      const auth = await requireUser(req);
      if (!auth.user) return auth.response;

      if (mine) {
        query['ngo.id'] = String(auth.user._id);
      }

      if (joined) {
        const memberships = await ProjectMember.find({
          'user.id': String(auth.user._id),
          status: 'joined',
        })
          .select('projectId')
          .lean();
        query._id = {
          $in: memberships.map((m) => new mongoose.Types.ObjectId(String(m.projectId))),
        };
      }
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    const counts = await roleCountsForProjects(projects.map((p) => String(p._id)));

    return NextResponse.json({
      success: true,
      projects: projects.map((project) => serializeProject(project, counts[String(project._id)])),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Could not load projects.' },
      { status: 500 }
    );
  }
}

/**
 * Create a project. Only NGO accounts can list one, the org identity comes
 * from the session, and the referral id (obtained offline from a government
 * office) is validated server-side. Projects go live immediately.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['ngo']);
    if (!auth.user) return auth.response;

    const user = auth.user;
    const body = await req.json().catch(() => ({}));

    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const category = String(body.category || '').trim();
    const referralId = String(body.referralId || '');

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required.' },
        { status: 400 }
      );
    }
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { success: false, message: 'Choose a valid category.' },
        { status: 400 }
      );
    }

    if (!isReferralValid(referralId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'The referral ID is not valid. Get the referral ID from your local government office.',
        },
        { status: 403 }
      );
    }

    const rolesResult = normalizeRoles(body.roles);
    if (rolesResult.error) {
      return NextResponse.json(
        { success: false, message: rolesResult.error },
        { status: 400 }
      );
    }

    let issueIds: string[] = [];
    if (body.issueIds && !isValidObjectIdList(body.issueIds)) {
      return NextResponse.json(
        { success: false, message: 'Invalid linked issue.' },
        { status: 400 }
      );
    }
    if (Array.isArray(body.issueIds)) issueIds = body.issueIds;

    const location = body.location || {};
    const startsAt = body.startsAt ? new Date(body.startsAt) : undefined;
    const endsAt = body.endsAt ? new Date(body.endsAt) : undefined;
    if (startsAt && endsAt && endsAt < startsAt) {
      return NextResponse.json(
        { success: false, message: 'The end date must be after the start date.' },
        { status: 400 }
      );
    }

    const project = await Project.create({
      title,
      description,
      category,
      ngo: ngoIdentity(user),
      location: {
        address: String(location.address || '').trim() || undefined,
        district: String(location.district || '').trim() || undefined,
        state: String(location.state || '').trim() || undefined,
        latitude: typeof location.latitude === 'number' ? location.latitude : undefined,
        longitude: typeof location.longitude === 'number' ? location.longitude : undefined,
      },
      startsAt,
      endsAt,
      roles: rolesResult.roles,
      status: 'open',
      referralId,
      referralVerifiedAt: new Date(),
      issueIds: issueIds.map((id) => new mongoose.Types.ObjectId(id)),
    });

    return NextResponse.json(
      {
        success: true,
        project: serializeProject(project.toObject()),
        projectId: String(project._id),
        projectUrl: `/projects/${String(project._id)}`,
        message: 'Your project is live on the volunteer board.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Could not create the project.' },
      { status: 500 }
    );
  }
}
