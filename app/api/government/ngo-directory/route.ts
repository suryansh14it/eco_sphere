import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import ProjectMember from '@/models/ProjectMember';
import NGOLocalInitiative from '@/models/NgoFundRequest';
import ManagedProject from '@/models/ManagedProject';
import { requireRole } from '@/lib/session';

/**
 * Registered NGOs and their work for the government dashboard.
 * GET -> every NGO with aggregate counts plus recent works, so the dashboard
 * can show a clickable list instead of static numbers.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = await requireRole(req, ['government']);
    if (!auth.user) return auth.response;

    const ngos = (await User.find({ role: 'ngo' })
      .select('name email organizationName registrationNumber focusAreas location createdAt')
      .sort({ createdAt: 1 })
      .lean()) as any[];

    const ngoIds = ngos.map((n) => String(n._id));

    const [projects, memberships, requests, workspaces] = await Promise.all([
      ngoIds.length
        ? (Project.find({ source: 'ngo', 'ngo.id': { $in: ngoIds } })
            .select('title status createdAt ngo source')
            .sort({ createdAt: -1 })
            .lean()) as any[]
        : Promise.resolve([]),
      ngoIds.length
        ? (ProjectMember.find({ status: 'joined' })
            .select('projectId roleId')
            .lean()) as any[]
        : Promise.resolve([]),
      ngoIds.length
        ? (NGOLocalInitiative.find({ ngoId: { $in: ngoIds } })
            .select('ngoId title status projectFunding approvedFunding submittedAt')
            .sort({ submittedAt: -1 })
            .lean()) as any[]
        : Promise.resolve([]),
      (await ManagedProject.find({ kind: 'volunteer' })
        .select('key completedAt progress')
        .lean()) as any[],
    ]);

    const memberIdByProject = new Map<string, number>();
    for (const m of memberships as any[]) {
      const key = String(m.projectId);
      memberIdByProject.set(key, (memberIdByProject.get(key) || 0) + 1);
    }
    const completedByKey = new Set(
      (workspaces as any[]).filter((w) => w.completedAt).map((w) => w.key)
    );

    const directory = ngos.map((ngo) => {
      const ngoId = String(ngo._id);
      const ownProjects = projects.filter((p) => String(p.ngo?.id) === ngoId);
      const volunteerCount = ownProjects.reduce(
        (sum, p) => sum + (memberIdByProject.get(String(p._id)) || 0),
        0
      );
      const ngoRequests = requests.filter((r) => String(r.ngoId) === ngoId);
      // A project is "completed" when the NGO closed it from its workspace.
      const projectList = ownProjects.map((p) => ({
        id: String(p._id),
        title: p.title,
        status: completedByKey.has(`volunteer-${String(p._id)}`)
          ? 'completed'
          : p.status === 'closed'
            ? 'completed'
            : p.status,
        volunteers: memberIdByProject.get(String(p._id)) || 0,
        createdAt: p.createdAt,
      }));
      return {
        id: ngoId,
        name: ngo.organizationName || ngo.name,
        contactName: ngo.name,
        email: ngo.email,
        registrationNumber: ngo.registrationNumber || '',
        focusAreas: ngo.focusAreas || [],
        memberSince: ngo.createdAt,
        totals: {
          projects: projectList.length,
          open: projectList.filter((p) => p.status === 'open').length,
          completed: projectList.filter((p) => p.status === 'completed').length,
          volunteers: volunteerCount,
          fundingRequests: ngoRequests.length,
          requestsPending: ngoRequests.filter((r) => r.status !== 'funded').length,
        },
        projects: projectList.slice(0, 12),
        fundingRequests: ngoRequests.slice(0, 12).map((r) => ({
          id: String(r._id),
          title: r.title,
          status: r.status,
          funding: r.approvedFunding || r.projectFunding,
          submittedAt: r.submittedAt,
        })),
      };
    });

    // Sort by activity so the busiest NGOs appear first.
    directory.sort((a, b) => b.totals.projects - a.totals.projects || b.totals.volunteers - a.totals.volunteers);

    return NextResponse.json({ success: true, ngos: directory });
  } catch (error: any) {
    console.error('government ngo-directory GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Could not load the NGO directory.' },
      { status: 500 }
    );
  }
}
