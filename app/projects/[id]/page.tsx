"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  HandHeart,
  Loader2,
  MapPin,
  PartyPopper,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/issues/public-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { toast } from "@/hooks/use-toast";
import { timeAgo } from "@/components/issues/issue-utils";
import type { ProjectItem } from "@/components/projects/project-feed";
import {
  dateLabel,
  locationLabel,
  projectCategoryLabel,
  projectStatusMeta,
} from "@/components/projects/project-utils";

interface RosterMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  roleId: string;
  roleTitle: string;
  joinedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [management, setManagement] = useState<{
    progress: number;
    completedAt?: string | null;
    media?: { kind: string; url: string; name?: string }[];
    documents?: { title: string; url?: string }[];
    notices?: { title: string; body: string; createdAt: string | Date }[];
  } | null>(null);
  const [myMembership, setMyMembership] = useState<{
    id: string;
    joinStatus: "joined" | "removed";
    roleId: string;
    joinedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load this project.");
      }
      setProject(data.project);
      setIsOwner(Boolean(data.isOwner));
      setMyMembership(data.myMembership || null);
      setManagement(data.management || null);
      // Full roster rides on the project payload for the owning NGO.
      setMembers(data.isOwner ? (data.project?.members || []) : []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Could not load this project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const joinedRoleId = useMemo(
    () =>
      myMembership && myMembership.joinStatus === "joined"
        ? myMembership.roleId
        : null,
    [myMembership]
  );

  const act = async (key: string, url: string, method: string, body?: Record<string, any>) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need an account to volunteer. If you were already signed in, sign in again.",
        variant: "destructive",
      });
      return;
    }
    setBusy(key);
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Action failed.");
      }
      toast({ title: data.message || "Done" });
      await load();
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
        <PublicHeader />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
        <PublicHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 font-serif text-2xl font-bold text-emerald-950">
            Project not found
          </h1>
          <p className="mt-2 text-stone-600">{error}</p>
          <Link href="/projects">
            <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">
              Back to the volunteer board
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusMeta = projectStatusMeta(project.status);
  const linkedIssues = project.issueIds || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center text-sm text-emerald-700 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to the volunteer project board
        </Link>

        <Card className="mb-6 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
              <Badge variant="outline">{projectCategoryLabel(project.category)}</Badge>
              {project.isReferralVerified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  title="Referral ID verified with a government office"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Referral verified
                </span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold text-emerald-950">{project.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <HandHeart className="h-4 w-4" />
                By {project.ngo.name}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {locationLabel(project.location as any) || "Location not specified"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {dateLabel(project.startsAt, project.endsAt) || "Dates to be announced"}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="font-serif text-lg">What volunteers will do</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-6 text-stone-700">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {linkedIssues.length > 0 && (
              <Card className="border-emerald-100 bg-emerald-50/40">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Linked reports</CardTitle>
                  <p className="text-sm text-stone-500">
                    This project grew out of the public issue board.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {linkedIssues.map((issueId) => (
                    <Link
                      key={issueId}
                      href={`/issues/${issueId}`}
                      className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Issue {issueId.slice(-6)}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <Users className="h-4 w-4" />
                  Volunteer roster
                </CardTitle>
                <p className="text-sm text-stone-500">
                  {project.totalFilled} of {project.totalSlots} volunteers signed up
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.roles.map((role) => {
                  const full = role.filled >= role.slots;
                  const isMyRole = joinedRoleId === role.id;
                  return (
                    <div
                      key={role.id}
                      className="rounded-lg border border-emerald-100 bg-stone-50/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800">{role.title}</p>
                          {role.description && (
                            <p className="mt-0.5 text-xs text-stone-500">{role.description}</p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            full ? "bg-stone-200 text-stone-600" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {role.filled}/{role.slots}
                        </span>
                      </div>

                      <div className="mt-3">
                        {project.status !== "open" ? (
                          <span className="text-xs font-medium text-stone-600">Not recruiting</span>
                        ) : isMyRole ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={busy !== null}
                            onClick={() =>
                              act("leave", `/api/projects/${project.id}/join`, "DELETE")
                            }
                          >
                            {busy === "leave" ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            You're in as {role.title} · Leave
                          </Button>
                        ) : full ? (
                          <span className="text-xs font-medium text-stone-600">Filled</span>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={busy !== null || isOwner}
                            onClick={() =>
                              act(
                                `join-${role.id}`,
                                `/api/projects/${project.id}/join`,
                                "POST",
                                { roleId: role.id }
                              )
                            }
                          >
                            {busy === `join-${role.id}` ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <HandHeart className="mr-2 h-4 w-4" />
                            )}
                            {isOwner ? "Your project" : `Join as ${role.title}`}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {project.status === "open" && (
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Take part</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!user && (
                    <p className="text-sm text-stone-600">
                      <Link
                        href="/login"
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to join as a volunteer. See a role with an open slot above.
                    </p>
                  )}
                  {user && joinedRoleId && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                        <PartyPopper className="h-4 w-4" />
                        You're on this project's roster ({timeAgo(myMembership?.joinedAt)}).
                      </p>
                    </div>
                  )}
                  {user && !joinedRoleId && (
                    <p className="text-sm text-stone-600">
                      Pick a role above that still has open slots, then join it.
                    </p>
                  )}
                  {isOwner && (
                    <Link
                      href={
                        user?.role === "government"
                          ? `/government/project-management/volunteer-${project.id}`
                          : `/ngo/projects/${project.id}`
                      }
                    >
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Manage this project
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {management && (management.media?.length || management.notices?.length || management.progress > 0) > 0 ? null : null}

            {(management?.media?.length || 0) > 0 || (management?.notices?.length || 0) > 0 ? (
              <Card className="mb-6 border-emerald-100">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Updates from {project.ngo?.name || "the organiser"}</CardTitle>
                  {management?.progress != null && management.progress > 0 && (
                    <div className="mt-1">
                      <div className="flex items-center gap-3">
                        <div className="h-3 flex-1 rounded-full bg-stone-100">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                            style={{ width: `${management.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-purple-600">{management.progress}%</span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {(management?.notices?.length || 0) > 0 && (
                    <div className="space-y-2">
                      {management!.notices!.slice(0, 5).map((n, i) => (
                        <div key={i} className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                          <p className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                            <Bell className="h-3.5 w-3.5" />
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-sm text-stone-600">{n.body}</p>
                          {n.createdAt && (
                            <p className="mt-1 text-xs text-stone-400">{timeAgo(String(n.createdAt))}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {(management?.media?.length || 0) > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {management!.media!.map((m, i) => (
                        <div key={i} className="overflow-hidden rounded-lg border border-emerald-100">
                          {m.kind === "video" ? (
                            <video src={m.url} controls className="h-28 w-full object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.url} alt={m.name || "project media"} className="h-28 w-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {isOwner && members.length > 0 && (
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-lg">
                    <Users className="h-4 w-4" />
                    Who has joined
                  </CardTitle>
                  <p className="text-sm text-stone-500">
                    Community volunteers on this project, with their contact details.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-lg border border-emerald-100 bg-stone-50/60 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-stone-800">{member.name}</p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                          {member.roleTitle}
                        </span>
                      </div>
                      <ul className="mt-1 space-y-0.5 text-xs text-stone-600">
                        <li>Email: {member.email}</li>
                        {member.phone && <li>Phone: {member.phone}</li>}
                        {member.location && <li>Location: {member.location}</li>}
                        <li className="text-purple-700">
                          Joined {timeAgo(String(member.joinedAt))}
                        </li>
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {isOwner && members.length === 0 && (
              <Card className="border-dashed border-purple-200">
                <CardContent className="p-5 text-center text-sm text-stone-500">
                  No volunteers yet. Share the <span className="font-mono">/projects/{project.id}</span> link with your community.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
