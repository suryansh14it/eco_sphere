import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ManagedProject, { ManagedAttendance } from '@/models/ManagedProject';
import ProjectMember from '@/models/ProjectMember';
import { requireRole } from '@/lib/session';

/**
 * Completed volunteer projects for the government dashboard.
 * Both NGOs and the government itself can run volunteer projects, and both
 * finish them from the shared management workspace — so completed means
 * "status completed on the project" regardless of who owns it. The workspace
 * overlay (when present) adds the photos/videos, completion summary and
 * attendance the manager recorded.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['government']);
    if (!auth.user) return auth.response;

    const overlayDocs = (await ManagedProject.find({
      kind: 'volunteer',
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .limit(200)
      .lean()) as any[];

    const overlayByRef = new Map(overlayDocs.map((o) => [String(o.refId), o]));
    const overlayIds = overlayDocs
      .map((o) => o.refId)
      .filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

    // Projects the workspaces marked complete, plus any project closed
    // outside a workspace, for both owners (ngo + government).
    const projects = (await Project.find({
      _id: { $in: overlayIds },
      status: 'completed',
    })
      .select('title description category ngo location source createdAt')
      .lean()) as any[];

    const memberRows = overlayIds.length
      ? ((await ProjectMember.find({
          projectId: { $in: overlayIds },
          status: 'joined',
        })
          .select('projectId user')
          .lean()) as any[])
      : [];

    const items = projects.map((p) => {
      const overlay = overlayByRef.get(String(p._id));
      const memberMap = new Map<string, any>();
      for (const m of memberRows.filter((m) => String(m.projectId) === String(p._id))) {
        memberMap.set(String(m.user.id), m.user);
      }
      const members = Array.from(memberMap.values()).filter(
        (u: any) => !(overlay?.removedUserIds || []).includes(String(u.id))
      );
      return {
        id: String(p._id),
        key: `volunteer-${String(p._id)}`,
        title: p.title,
        description: p.description,
        category: p.category,
        source: p.source || 'ngo',
        organisation: p.source === 'government' ? 'Government' : (p.ngo?.name || 'NGO'),
        location: [p.location?.address, p.location?.district, p.location?.state]
          .filter(Boolean)
          .join(', '),
        completedAt: overlay?.completedAt || null,
        completedSummary: overlay?.completedSummary || '',
        progress: overlay?.progress ?? 100,
        media: overlay?.media || [],
        documents: overlay?.documents || [],
        notices: overlay?.notices || [],
        participants: members.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
        })),
        attendanceDates: [],
      };
    });

    // Sort by completion date, newest first.
    items.sort((a, b) => {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return tb - ta;
    });

    // Attendance date counts per completed item (for the detail view).
    const keys = items.map((i) => i.key);
    if (keys.length) {
      const attendance = (await ManagedAttendance.find({ key: { $in: keys } })
        .select('key date')
        .lean()) as any[];
      for (const item of items) {
        item.attendanceDates = attendance
          .filter((a) => a.key === item.key)
          .map((a) => a.date);
      }
    }

    return NextResponse.json({ success: true, completed: items });
  } catch (error: any) {
    console.error('government completed-projects GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Could not load completed projects.' },
      { status: 500 }
    );
  }
}
