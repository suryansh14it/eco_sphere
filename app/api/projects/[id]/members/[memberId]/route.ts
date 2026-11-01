import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ProjectMember, { IProjectMember } from '@/models/ProjectMember';
import { requireUser } from '@/lib/session';

/**
 * The owning NGO removes a volunteer. `status: "removed"` keeps the record
 * (who joined, when) while freeing the slot on the public board.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = await requireUser(req);
    if (!auth.user) return auth.response;

    const { id, memberId } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found.' }, { status: 404 });
    }

    if (project.ngo.id !== String(auth.user._id)) {
      return NextResponse.json(
        { success: false, message: 'Only the NGO that started this project can manage its volunteers.' },
        { status: 403 }
      );
    }

    if (!mongoose.isValidObjectId(memberId)) {
      return NextResponse.json({ success: false, message: 'Volunteer not found.' }, { status: 404 });
    }

    const member = (await ProjectMember.findById(memberId).lean()) as unknown as IProjectMember | null;
    if (!member || member.projectId !== id || member.status !== 'joined') {
      return NextResponse.json(
        { success: false, message: 'That volunteer is not currently signed up.' },
        { status: 404 }
      );
    }

    await ProjectMember.updateOne(
      { _id: member._id },
      { $set: { status: 'removed', removedBy: 'ngo' } }
    );

    return NextResponse.json({
      success: true,
      message: `${member.user.name} was removed from the project.`,
    });
  } catch (error: any) {
    console.error('Error removing volunteer:', error);
    return NextResponse.json(
      { success: false, message: 'Could not remove this volunteer.' },
      { status: 500 }
    );
  }
}
