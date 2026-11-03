import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectMember from '@/models/ProjectMember';
import { requireUser, requireRole } from '@/lib/session';
import ManagedProject from '@/models/ManagedProject';
import {
  isValidCategory,
  membersForProjects,
  normalizeRoles,
  roleCountForProject,
  serializeProject,
} from '@/lib/project-service';

/**
 * One volunteer project. Public read; roster (names + emails) is only
 * returned to the owning NGO. A signed-in volunteer also learns whether
 * they have already joined.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const counts = await roleCountForProject(id);
    const serialized = serializeProject(project.toObject(), counts);

    const auth = await requireUser(req);
    const authUser = auth.user;
    const isOwner = Boolean(
      authUser && authUser.role === 'ngo' && serialized.ngo.id === String(authUser._id)
    );

    let myMembership: { id: string; joinStatus: 'joined' | 'removed'; roleId: string; joinedAt: string } | null = null;

    if (authUser) {
      const own = await ProjectMember.findOne({
        projectId: id,
        'user.id': String(authUser._id),
      })
        .sort({ joinedAt: -1 })
        .lean();

      if (own) {
        myMembership = {
          id: String(own._id),
          joinStatus: own.status,
          roleId: own.roleId,
          joinedAt: own.joinedAt,
        };
      }
    }

    // Full roster (with profile extras) exists only for the owning NGO. It is
    // already embedded in the serialized project as `members`.
    const finalProject = isOwner
      ? serializeProject(
          project.toObject(),
          counts,
          (await membersForProjects([id]))[id]
        )
      : serialized;

    // Management highlights (progress, gallery, notices) are public so
    // participants can follow the project's story.
    const workspace = await ManagedProject.findOne({ key: `volunteer-${id}` })
      .lean() as any;
    const management = workspace
      ? {
          progress: workspace.progress || 0,
          completedAt: workspace.completedAt || null,
          media: workspace.media || [],
          documents: workspace.documents || [],
          notices: workspace.notices || [],
        }
      : null;

    return NextResponse.json({
      success: true,
      project: finalProject,
      isOwner,
      myMembership,
      management,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, message: 'Could not load this project.' },
      { status: 500 }
    );
  }
}

/**
 * Edit a project. Owner NGO only. Slots may grow freely but can never drop
 * below the number of volunteers already in a role; a role with volunteers
 * cannot be deleted.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['ngo']);
    if (!auth.user) return auth.response;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    if (project.ngo.id !== String(auth.user._id)) {
      return NextResponse.json(
        { success: false, message: 'Only the NGO that started this project can edit it.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const updates: Record<string, any> = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ success: false, message: 'Title cannot be empty.' }, { status: 400 });
      }
      updates.title = title;
    }

    if (body.description !== undefined) {
      const description = String(body.description).trim();
      if (!description) {
        return NextResponse.json({ success: false, message: 'Description cannot be empty.' }, { status: 400 });
      }
      updates.description = description;
    }

    if (body.category !== undefined) {
      if (!isValidCategory(String(body.category))) {
        return NextResponse.json({ success: false, message: 'Choose a valid category.' }, { status: 400 });
      }
      updates.category = body.category;
    }

    if (body.location !== undefined) {
      const location = body.location || {};
      updates.location = {
        address: String(location.address || '').trim() || undefined,
        district: String(location.district || '').trim() || undefined,
        state: String(location.state || '').trim() || undefined,
        latitude: typeof location.latitude === 'number' ? location.latitude : undefined,
        longitude: typeof location.longitude === 'number' ? location.longitude : undefined,
      };
    }

    if (body.startsAt !== undefined) updates.startsAt = body.startsAt ? new Date(body.startsAt) : undefined;
    if (body.endsAt !== undefined) updates.endsAt = body.endsAt ? new Date(body.endsAt) : undefined;
    if (updates.startsAt && updates.endsAt && updates.endsAt < updates.startsAt) {
      return NextResponse.json(
        { success: false, message: 'The end date must be after the start date.' },
        { status: 400 }
      );
    }

    if (body.status !== undefined) {
      if (!['open', 'closed', 'completed'].includes(body.status)) {
        return NextResponse.json({ success: false, message: 'Invalid status.' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.roles !== undefined) {
      const rolesResult = normalizeRoles(body.roles);
      if (rolesResult.error) {
        return NextResponse.json({ success: false, message: rolesResult.error }, { status: 400 });
      }

      const counts = await roleCountForProject(id);
      const newIds = new Set(rolesResult.roles.map((role) => role._id && String(role._id)));

      for (const existingRole of project.roles) {
        const existingId = String(existingRole._id);
        const filled = counts[existingId] || 0;

        if (!newIds.has(existingId)) {
          if (filled > 0) {
            return NextResponse.json(
              {
                success: false,
                message: `"${existingRole.title}" already has ${filled} volunteer(s) - you cannot remove it while people are signed up.`,
              },
              { status: 409 }
            );
          }
          continue; // removing an empty role is fine
        }

        const nextRole = rolesResult.roles.find((role) => String(role._id) === existingId);
        if (nextRole && nextRole.slots < filled) {
          return NextResponse.json(
            {
              success: false,
              message: `"${nextRole.title}" already has ${filled} volunteer(s) - you cannot shrink it below that.`,
            },
            { status: 409 }
          );
        }
      }

      updates.roles = rolesResult.roles;
    }

    const updated = await Project.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const counts = await roleCountForProject(id);
    return NextResponse.json({
      success: true,
      project: serializeProject(updated.toObject(), counts),
      message: 'Project updated.',
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Could not update the project.' },
      { status: 500 }
    );
  }
}
