import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectMember from '@/models/ProjectMember';
import { requireUser } from '@/lib/session';

/**
 * Join a project as a volunteer.
 *
 * Direct join - no NGO approval step - but capacity is real: insert first,
 * then count, and roll back the insert if someone filled the last slot in the
 * same instant. Keeping `filled` derived from memberships means the counts on
 * the public board can never drift.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = await requireUser(req);
    if (!auth.user) return auth.response;
    const user = auth.user;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const roleId = String(body.roleId || '');

    const role = project.roles.find((r) => String(r._id) === roleId);
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Pick a volunteer role below.' },
        { status: 400 }
      );
    }

    if (project.ngo.id === String(user._id)) {
      return NextResponse.json(
        { success: false, message: 'You cannot join your own project as a volunteer.' },
        { status: 403 }
      );
    }

    if (project.status !== 'open') {
      return NextResponse.json(
        { success: false, message: 'This project is no longer recruiting volunteers.' },
        { status: 409 }
      );
    }

    const already = await ProjectMember.findOne({
      projectId: id,
      'user.id': String(user._id),
      status: 'joined',
    });
    if (already) {
      return NextResponse.json(
        { success: false, message: 'You have already joined this project.' },
        { status: 409 }
      );
    }

    // Historical "removed" records don't block a fresh join - clean them up
    // so the roster stays readable.
    await ProjectMember.deleteMany({
      projectId: id,
      'user.id': String(user._id),
      status: 'removed',
    });

    const created = await ProjectMember.create({
      projectId: id,
      roleId: String(role._id),
      user: { id: String(user._id), name: user.name, email: user.email },
    });

    const joinedCount = await ProjectMember.countDocuments({
      projectId: id,
      roleId: String(role._id),
      status: 'joined',
    });

    if (joinedCount > role.slots) {
      await ProjectMember.deleteOne({ _id: created._id });
      return NextResponse.json(
        { success: false, message: `All ${role.slots} "${role.title}" slots were just taken.` },
        { status: 409 }
      );
    }

    await user.addXP(5, {
      eventType: 'project_joined',
      description: `Volunteered: ${project.title}`,
      relatedItemId: `project-${project._id}`,
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        membershipId: String(created._id),
        roleTitle: role.title,
        message: `You're in! Signed up as "${role.title}".`,
        xpAwarded: 5,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'You have already joined this project.' },
        { status: 409 }
      );
    }
    console.error('Error joining project:', error);
    return NextResponse.json(
      { success: false, message: 'Could not join this project. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Leave a project. Slots become available again immediately.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = await requireUser(req);
    if (!auth.user) return auth.response;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const result = await ProjectMember.findOneAndUpdate(
      {
        projectId: id,
        'user.id': String(auth.user._id),
        status: 'joined',
      },
      { $set: { status: 'removed', removedBy: 'volunteer' } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "You haven't joined this project." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'You have left this project.',
    });
  } catch (error: any) {
    console.error('Error leaving project:', error);
    return NextResponse.json(
      { success: false, message: 'Could not leave this project. Please try again.' },
      { status: 500 }
    );
  }
}
