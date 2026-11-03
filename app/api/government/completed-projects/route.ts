import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import ManagedProject, { ManagedAttendance } from '@/models/ManagedProject';
import ProjectMember from '@/models/ProjectMember';
import { requireRole } from '@/lib/session';

/**
 * Completed volunteer projects for the government dashboard.
 * Everything an NGO finished (via its management workspace or by closing the
 * project), including the photos/videos, completion summary and the
 * participant roster that the NGO recorded.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['government']);
    if (!auth.user) return auth.response;

    // Completed = workspace was marked complete, or the project itself was
    // closed. Both paths archive the project.
    const overlayDocs = (await ManagedProject.find({
      kind: 'volunteer',
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .limit(200)
      .lean()) as any[];

    const overlayByRef = new Map(overlayDocs.map((o) => [o.refId, o]));
    let items: any[] = [];

    const explicitIds = overlayDocs.map((o) => o.refId).filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
    if (explicitIds.length) {
      const projects = (await Project.find({
        _id: { $in: explicitIds },
        source: 'ngo',
      })
        .select('title description category ngo location source createdAt')
        .lean()) as any[];
      const memberSets = await ProjectMember.find({
        projectId: { $in: explicitIds },
        status: 'joined',
      })
        .select('projectId user roleId')
        .lean();

      items = projects.map((p) => {
        const overlay = overlayByRef.get(String(p._id));
        const memberMap = new Map<string, any>();
        for (const m of memberSets.filter((m) => String(m.projectId) === String(p._id))) {
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
          organisation: p.ngo?.name || 'NGO',
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
    }

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
