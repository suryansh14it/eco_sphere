"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bird,
  Building2,
  Calendar,
  Clock,
  Droplets,
  Factory,
  HandHeart,
  Loader2,
  MapPin,
  Search,
  Trash2,
  TreePine,
  Users,
  Waves,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { timeAgo } from "@/components/issues/issue-utils";
import {
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  locationLabel,
  projectCategoryLabel,
  projectStatusMeta,
} from "./project-utils";

export type ProjectFeedMode = "public" | "mine";

interface ProjectFeedProps {
  mode?: ProjectFeedMode;
}

interface RoleItem {
  id: string;
  title: string;
  description?: string;
  slots: number;
  filled: number;
}

export interface VolunteerMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  roleId: string;
  roleTitle: string;
  joinedAt: string | Date;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  ngo: { id: string; name: string; email: string };
  location?: { address?: string; district?: string; state: string } | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status: string;
  isReferralVerified?: boolean;
  roles: RoleItem[];
  members?: VolunteerMember[];
  totalSlots: number;
  totalFilled: number;
  createdAt?: string;
}

export const PROJECT_ICONS: Record<string, typeof Droplets> = {
  pollution: Droplets,
  waste: Trash2,
  deforestation: TreePine,
  industrial: Factory,
  water: Waves,
  air: Wind,
  wildlife: Bird,
  encroachment: Building2,
  other: AlertTriangle,
};

const MODE_DEFAULTS: Record<ProjectFeedMode, { status: string; title: string; subtitle: string }> = {
  public: {
    status: "",
    title: "Volunteer Projects",
    subtitle:
      "Community-driven projects started by NGOs. See how many volunteers are needed, pick a role, and join in.",
  },
  mine: {
    status: "",
    title: "My Projects",
    subtitle:
      "Projects your organisation has started, and the volunteers who have signed up.",
  },
};

export function ProjectFeed({ mode = "public" }: ProjectFeedProps) {
  const defaults = MODE_DEFAULTS[mode];
  const { user } = useAuth();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState(defaults.status);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [joined, setJoined] = useState(false);

  const mineOnly = mode === "mine";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (mineOnly) params.set("mine", "1");
    if (joined) params.set("joined", "1");
    params.set("limit", "60");
    return params.toString();
  }, [status, category, debouncedSearch, mineOnly, joined]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/projects?${queryString}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load projects.");
      }
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const sorted = useMemo(() => {
    const items = [...projects];
    if (sort === "vacancies") {
      items.sort((a, b) => b.totalSlots - b.totalFilled - (a.totalSlots - a.totalFilled));
    } else if (sort === "supporters") {
      items.sort((a, b) => b.totalFilled - a.totalFilled);
    }
    return items;
  }, [projects, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-950">{defaults.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">{defaults.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mineOnly && (
            <Link href="/ngo/projects/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <HandHeart className="mr-2 h-4 w-4" />
                Start a project
              </Button>
            </Link>
          )}
          <Link href="/issues">
            <Button variant="outline">Browse issues</Button>
          </Link>
        </div>
      </div>

      <Card className="border-emerald-100">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects by title, description or place..."
              className="pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {PROJECT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="vacancies">Most vacancies</option>
            <option value="supporters">Most volunteers</option>
          </select>

          {!mineOnly && user && (
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={joined}
                onChange={(event) => setJoined(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Joined by me
            </label>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          {loading ? "Loading..." : `${total} project${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : sorted.length === 0 ? (
        <Card className="border-dashed border-emerald-200">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-emerald-300" />
            <p className="font-medium text-emerald-900">No projects match these filters</p>
            <p className="max-w-sm text-sm text-stone-500">
              {mineOnly
                ? "Start your first project and it will appear here with live volunteer counts."
                : "Try clearing the filters, or check back soon - new projects appear the moment an NGO lists them."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((project) => {
            const Icon = PROJECT_ICONS[project.category] || AlertTriangle;
            const statusMeta = projectStatusMeta(project.status);
            const openRoles = project.roles.filter((role) => role.filled < role.slots);

            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group">
                <Card className="h-full border-emerald-100 transition hover:border-emerald-300 hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                            {projectCategoryLabel(project.category)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusMeta.className}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                            {statusMeta.label}
                          </span>
                        </div>
                      </div>
                      {project.isReferralVerified && (
                        <span
                          className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700"
                          title="Referral ID verified with a government office"
                        >
                          ✓ Referral
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-semibold text-emerald-950 group-hover:underline">
                        {project.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-600">{project.description}</p>
                    </div>

                    {openRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {openRoles.slice(0, 3).map((role) => (
                          <span
                            key={role.id}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                          >
                            {role.title}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {mode === "mine" && (project.members?.length || 0) > 0 && (
                      <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-purple-900">
                          <Users className="h-3.5 w-3.5" />
                          Volunteers joined ({project.members!.length})
                        </p>
                        <div className="space-y-2">
                          {project.members!.map((member) => (
                            <div
                              key={member.id}
                              className="rounded-md border border-purple-100 bg-white px-2.5 py-2 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-stone-800">{member.name}</span>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                  {member.roleTitle}
                                </span>
                              </div>
                              <p className="mt-1 text-stone-600">Email: {member.email}</p>
                              {member.phone && <p className="text-stone-600">Phone: {member.phone}</p>}
                              {member.location && (
                                <p className="text-stone-600">Location: {member.location}</p>
                              )}
                              {member.joinedAt && (
                                <p className="mt-1 text-purple-700">
                                  Joined {timeAgo(String(member.joinedAt))}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === "mine" && (project.members?.length || 0) === 0 && (
                      <p className="rounded-lg border border-dashed border-purple-200 p-2 text-xs text-stone-500">
                        No volunteers yet - share the project link to recruit.
                      </p>
                    )}

                    <div className="mt-auto space-y-2 text-xs text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{locationLabel(project.location as any) || "Location not specified"}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-purple-700">
                          <Users className="h-3.5 w-3.5" />
                          {project.totalFilled} of {project.totalSlots} volunteers
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {project.startsAt ? timeAgo(project.startsAt) : "No start date"}
                        </span>
                      </div>
                      <p className="text-stone-600">By {project.ngo.name}</p>
                    </div>

                    <div className="flex items-center justify-end pt-1 text-xs font-medium text-emerald-700">
                      {mineOnly
                        ? `${openRoles.length} role${openRoles.length === 1 ? "" : "s"} recruiting`
                        : project.status === "open" && openRoles.length > 0
                          ? "View & join"
                          : "View details"}
                      <Clock className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
