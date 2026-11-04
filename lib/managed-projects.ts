import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Issue from '@/models/Issue';
import User from '@/models/User';
import ProjectMember from '@/models/ProjectMember';
import ManagedProject, { IManagedAttendance, IManagedProject } from '@/models/ManagedProject';
import { membersForProjects } from '@/lib/project-service';

export const ATTENDANCE_XP = 10;

export function managedKey(kind: 'volunteer' | 'issue', refId: string) {
  return `${kind}-${refId}`;
}

export function parseKey(key: string): { kind: 'volunteer' | 'issue'; refId: string } | null {
  const m = String(key).match(/^(volunteer|issue)-([0-9a-fA-F]{24})$/);
  if (!m) return null;
  return { kind: m[1] as 'volunteer' | 'issue', refId: m[2] };
}

export interface ManagedMember {
  userId: string;
  name: string;
  email: string;
  roleTitle: string;
  joinedAt: string | Date | null;
  removed?: boolean;
}

export interface ManagedItem {
  key: string;
  kind: 'volunteer' | 'issue';
  refId: string;
  title: string;
  description: string;
  location: string;
  /** Extra source detail; volunteer projects also carry a public /projects link. */
  href: string;
  progress: number;
  completedAt: Date | null;
  completedSummary: string;
  media: IManagedProject['media'];
  documents: IManagedProject['documents'];
  notices: IManagedProject['notices'];
  members: ManagedMember[];
  memberCount: number;
}

/** Fresh overlay row (or null) that ensures the workspace doc exists. */
export async function ensureWorkspace(
  kind: 'volunteer' | 'issue',
  refId: string,
  ngoId: string,
  title: string
): Promise<IManagedProject> {
  const key = managedKey(kind, refId);
  const existing = await ManagedProject.findOne({ key });
  if (existing) return existing;
  return ManagedProject.create({ key, ngoId, kind, refId, progress: 0, completedAt: null });
}

/** Community members currently on an undertaking (roster or issue confirmers). */
export async function membersForUndertaking(
  kind: 'volunteer' | 'issue',
  refId: string,
  removedUserIds: string[]
): Promise<ManagedMember[]> {
  const removed = new Set(removedUserIds);

  if (kind === 'volunteer') {
    // Joined volunteers are snapshot on ProjectMember; re-join User for phone.
    // Role titles live on the project's roles, keyed by the membership's
    // roleId, so resolve them here (~Volunteer only for legacy rows that
    // predate role tracking).
    const rows = (await membersForProjects([refId]))[refId] || [];
    const project = (await Project.findById(refId)
      .select('roles')
      .lean()) as any;
    const roleTitleById = new Map(
      (project?.roles || []).map((r: any) => [String(r._id), String(r.title)])
    );
    return rows
      .filter((m) => !removed.has(m.userId))
      .map((m) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        roleTitle: roleTitleById.get(String(m.roleId)) || m.roleTitle || 'Volunteer',
        joinedAt: m.joinedAt as Date,
      }));
  }

  // Adopted issue: community members who engaged with the report are the
  // participating pool (confirmations carry userId + name).
  const issue = await Issue.findById(refId)
    .select('confirmations')
    .lean() as any;
  const seen = new Set<string>();
  const members: ManagedMember[] = [];
  for (const c of issue?.confirmations || []) {
    const userId = String(c.userId);
    if (seen.has(userId) || removed.has(userId)) continue;
    seen.add(userId);
    members.push({
      userId,
      name: c.name || 'Community member',
      email: '',
      roleTitle: c.type === 'confirm' ? 'Confirmed issue' : c.type === 'still_happening' ? 'Follow-up reporter' : 'Fix reporter',
      joinedAt: c.createdAt || null,
    });
  }
  // Resolve emails for XP/attendance display.
  const users = members.length
    ? await User.find({ _id: { $in: members.map((m) => m.userId) } }).select('email').lean() as any[]
    : [];
  const emailById = new Map(users.map((u) => [String(u._id), u.email || '']));
  return members.map((m) => ({ ...m, email: emailById.get(m.userId) || m.email }));
}

/**
 * Everything the NGO has undertaken: its volunteer projects + the public
 * issues it adopted, merged with the management overlay. Split into live
 * (not completed) and completed buckets.
 */
export async function undertakingsForNgo(ngoId: string) {
  await connectDB();
  const start = Date.now();

  const [projects, issues] = await Promise.all([
    Project.find({ 'ngo.id': ngoId }).sort({ createdAt: -1 }).lean() as any[],
    Issue.find({
      'assignedNgo.id': ngoId,
      status: { $nin: ['reported'] },
    })
      .sort({ updatedAt: -1 })
      .select('title description location status confirmations assignedNgo')
      .lean() as any[],
  ]);

  const keys: string[] = [
    ...projects.map((p) => managedKey('volunteer', String(p._id))),
    ...issues.map((i) => managedKey('issue', String(i._id))),
  ];
  const overlays = keys.length
    ? (await ManagedProject.find({ key: { $in: keys } }).lean()) as any[]
    : [];
  const overlayByKey = new Map(overlays.map((o) => [o.key, o]));

  const items: ManagedItem[] = [];
  for (const project of projects) {
    const refId = String(project._id);
    const key = managedKey('volunteer', refId);
    const overlay = overlayByKey.get(key);
    const removed = overlay?.removedUserIds || [];
    const members = await membersForUndertaking('volunteer', refId, removed);
    items.push(baseItem('volunteer', refId, key, project, overlay, members, project.location));
  }
  for (const issue of issues) {
    const refId = String(issue._id);
    const key = managedKey('issue', refId);
    const overlay = overlayByKey.get(key);
    const removed = overlay?.removedUserIds || [];
    const members = await membersForUndertaking('issue', refId, removed);
    items.push(baseItem('issue', refId, key, issue, overlay, members, issue.location?.address));
  }

  const live: ManagedItem[] = [];
  const completed: ManagedItem[] = [];
  for (const item of items) {
    (item.completedAt ? completed : live).push(item);
  }

  return { live, completed, ms: Date.now() - start };
}

function baseItem(
  kind: 'volunteer' | 'issue',
  refId: string,
  key: string,
  source: any,
  overlay: any,
  members: ManagedMember[],
  location: any
): ManagedItem {
  return {
    key,
    kind,
    refId,
    title: source.title,
    description: source.description || '',
    location:
      [
        location?.address,
        location?.district,
        location?.state,
      ]
        .filter(Boolean)
        .join(', ') || 'Not specified',
    href: kind === 'volunteer' ? `/projects/${refId}` : `/issues/${refId}`,
    progress: overlay?.progress || 0,
    completedAt: overlay?.completedAt || null,
    completedSummary: overlay?.completedSummary || '',
    media: overlay?.media || [],
    documents: overlay?.documents || [],
    notices: overlay?.notices || [],
    members,
    memberCount: members.length,
  };
}

/** One undertaking incl. full detail (used by the management workspace). */
export async function undertakingForNgo(ngoId: string, key: string) {
  const parsed = parseKey(key);
  if (!parsed) return null;

  let source: any = null;
  if (parsed.kind === 'volunteer') {
    source = await Project.findById(parsed.refId).lean();
  } else {
    source = await Issue.findById(parsed.refId)
      .select('title description location confirmations assignedNgo status')
      .lean();
  }
  if (!source) return null;
  // Ownership: NGO must own the volunteer project or have adopted the issue.
  const ownerId =
    parsed.kind === 'volunteer' ? String(source.ngo?.id) : String(source.assignedNgo?.id);
  if (ownerId !== String(ngoId)) return null;

  const overlay = await ensureWorkspace(parsed.kind, parsed.refId, String(ngoId), source.title);
  const members = await membersForUndertaking(parsed.kind, parsed.refId, overlay.removedUserIds || []);
  const item = baseItem(parsed.kind, parsed.refId, key, source, overlay.toObject(), members, source.location);
  return item;
}

/** Attendance rows for a date on one undertaking. */
export async function attendanceForDate(key: string, date: string): Promise<IManagedAttendance | null> {
  return (await (await import('@/models/ManagedProject')).ManagedAttendance.findOne({ key, date }).lean()) as any;
}

/** Award XP to a community member and return their new totals. */
export async function awardXpToUser(userId: string, amount: number, description: string, relatedItemId?: string) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'user') return null;
  await user.addXP(amount, {
    eventType: 'project_joined',
    description,
    relatedItemId,
    xpEarned: amount,
  });
  return { userId, xpPoints: user.xpPoints, level: user.level };
}

export function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || ''));
}

export { ProjectMember };
