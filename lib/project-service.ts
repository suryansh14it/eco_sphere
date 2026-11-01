import mongoose from 'mongoose';
import Project, { IRole, PROJECT_CATEGORIES } from '@/models/Project';
import ProjectMember from '@/models/ProjectMember';
import { IUser } from '@/models/User';

/**
 * Referral gate.
 *
 * SOFT GATE ONLY: the expected id is derived from the NGO's own registered
 * organisation name, so anyone who can create an account can derive it. It
 * stops casual/spam listings, not impersonation. Real verification later =
 * matching `registrationNumber` against a government registry.
 */
export function expectedReferralId(organizationName: string): string {
  const slug = (organizationName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return slug ? `${slug}1234` : '';
}

export function isReferralValid(input: string, organizationName: string): boolean {
  const normalize = (value: string) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const expected = expectedReferralId(organizationName);
  return Boolean(expected) && normalize(input) === expected;
}

export interface GroupedRoleCounts {
  /** projectId -> roleId -> joined member count */
  [projectId: string]: {
    [roleId: string]: number;
  };
}

/** Joined-member counts per project and role, in one aggregate. */
export async function roleCountsForProjects(projectIds: string[]): Promise<GroupedRoleCounts> {
  if (projectIds.length === 0) return {};

  const rows = await ProjectMember.aggregate([
    {
      $match: {
        projectId: { $in: projectIds },
        status: 'joined',
      },
    },
    {
      $group: {
        _id: { projectId: '$projectId', roleId: '$roleId' },
        count: { $sum: 1 },
      },
    },
  ]);

  const grouped: GroupedRoleCounts = {};
  for (const row of rows) {
    const projectId = String(row._id.projectId);
    grouped[projectId] = grouped[projectId] || {};
    grouped[projectId][String(row._id.roleId)] = row.count;
  }
  return grouped;
}

export async function roleCountForProject(projectId: string): Promise<GroupedRoleCounts[string]> {
  const grouped = await roleCountsForProjects([projectId]);
  return grouped[projectId] || {};
}

/** Mongoose lean docs carry ObjectIds; JSON responses want strings. */
export function serializeProject(project: any, counts?: GroupedRoleCounts[string]) {
  const roles = (project.roles || []).map((role: any) => ({
    id: String(role._id),
    title: role.title,
    description: role.description || '',
    slots: role.slots,
    filled: counts?.[String(role._id)] || 0,
  }));

  return {
    id: String(project._id),
    title: project.title,
    description: project.description,
    category: project.category,
    ngo: project.ngo,
    location: project.location || null,
    startsAt: project.startsAt || null,
    endsAt: project.endsAt || null,
    status: project.status,
    issueIds: (project.issueIds || []).map(String),
    referralVerifiedAt: project.referralVerifiedAt || null,
    roles,
    totalSlots: roles.reduce((sum: number, role: any) => sum + role.slots, 0),
    totalFilled: roles.reduce((sum: number, role: any) => sum + role.filled, 0),
    isReferralVerified: Boolean(project.referralVerifiedAt),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

/**
 * Roles need at least one open vacancy; never trust more than a handful of
 * distinct roles on one project.
 */
export function normalizeRoles(input: unknown):
  | { error: null; roles: IRole[] }
  | { error: string; roles: null } {
  const raw = Array.isArray(input) ? input : [];
  if (raw.length === 0) return { error: 'Add at least one volunteer role with the number of volunteers needed.', roles: null };
  if (raw.length > 10) return { error: 'A project can list at most 10 roles.', roles: null };

  const roles: IRole[] = [];
  for (const entry of raw) {
    const title = String(entry?.title || '').trim();
    const slots = Number(entry?.slots);
    const description = String(entry?.description || '').trim();

    if (!title) return { error: 'Every volunteer role needs a title.', roles: null };
    if (!Number.isInteger(slots) || slots < 1 || slots > 500) {
      return { error: `"${title}" needs a whole number of volunteer openings between 1 and 500.`, roles: null };
    }

    roles.push({ _id: entry?._id ? String(entry._id) : undefined, title, description: description || undefined, slots });
  }
  return { error: null, roles };
}

export function isValidCategory(category: string): boolean {
  return (PROJECT_CATEGORIES as readonly string[]).includes(category);
}

export function isValidObjectIdList(values: unknown): values is string[] {
  return (
    Array.isArray(values) &&
    values.length <= 20 &&
    values.every((value) => mongoose.isValidObjectId(value))
  );
}

export function ngoIdentity(user: IUser) {
  return {
    id: String(user._id),
    name: user.organizationName || user.name,
    email: user.email,
  };
}
