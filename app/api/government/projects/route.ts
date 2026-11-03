import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { requireRole } from '@/lib/session';
import {
  isValidCategory,
  normalizeRoles,
  roleCountsForProjects,
  serializeProject,
} from '@/lib/project-service';

/**
 * Government-created projects.
 *
 * Government officials can open volunteer projects directly (same format as
 * NGO volunteer projects: roles with concrete slot counts, categories,
 * locations). These carry `source: 'government'` so:
 *   - community users see and can join them from a dedicated feed,
 *   - NGOs never see them (their dashboards and boards filter to NGO work),
 *   - they never appear on the general volunteer board.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['government']);
    if (!auth.user) return auth.response;

    const projects = await (Project.find({ source: 'government', 'ngo.id': String(auth.user._id) })
      .sort({ createdAt: -1 })
      .lean()) as any[];
    const counts = await roleCountsForProjects(projects.map((p) => String(p._id)));

    return NextResponse.json({
      success: true,
      projects: projects.map((project) => serializeProject(project, counts[String(project._id)])),
    });
  } catch (error: any) {
    console.error('government projects GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Could not load your projects.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['government']);
    if (!auth.user) return auth.response;
    const user = auth.user;

    const body = await req.json().catch(() => ({}));
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const category = String(body.category || '').trim();

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

    const rolesResult = normalizeRoles(body.roles);
    if (rolesResult.error) {
      return NextResponse.json(
        { success: false, message: rolesResult.error },
        { status: 400 }
      );
    }

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
      source: 'government',
      ngo: {
        id: String(user._id),
        name: [user.department, user.name].filter(Boolean).join(' · ') || user.name,
        email: user.email,
      },
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
      // Government-created projects skip the NGO referral gate.
      referralId: 'GOVERNMENT-DIRECT',
      referralVerifiedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        project: serializeProject(project.toObject()),
        projectId: String(project._id),
        projectUrl: `/projects/${String(project._id)}`,
        message: 'Project created. It is now visible to community users, who can volunteer to join it.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('government projects POST error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Could not create the project.' },
      { status: 500 }
    );
  }
}
