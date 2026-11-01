"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { timeAgo } from "@/components/issues/issue-utils";
import { useAuth } from "@/components/auth-provider";
import { ProjectForm, type ProjectFormValues } from "@/components/projects/project-form";
import { projectStatusMeta } from "@/components/projects/project-utils";
import type { ProjectItem } from "@/components/projects/project-feed";

interface RosterMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleTitle: string;
  joinedAt: string;
}

export default function ManageProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busyMember, setBusyMember] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load this project.");
      }
      setProject(data.project);
      setMembers(data.members || []);
      setIsOwner(Boolean(data.isOwner));
    } catch (err: any) {
      setError(err.message || "Could not load this project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (values: ProjectFormValues) => {
    if (!id) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          category: values.category,
          status: values.status,
          location: {
            address: values.address,
            district: values.district,
            state: values.state,
          },
          startsAt: values.startsAt || undefined,
          endsAt: values.endsAt || undefined,
          roles: values.roles,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update the project.");
      }
      toast({ title: "Project updated" });
      await load();
    } catch (err: any) {
      setError(err.message || "Could not update the project.");
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (member: RosterMember) => {
    if (!id) return;
    setBusyMember(member.id);
    try {
      const response = await fetch(`/api/projects/${id}/members/${member.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not remove the volunteer.");
      }
      toast({ title: data.message });
      await load();
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setBusyMember(null);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-emerald-950">Project not found</h1>
        <p className="mt-2 text-stone-600">{error}</p>
        <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push("/ngo/projects")}>
          Back to my projects
        </Button>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-emerald-950">Sign in required</h1>
        <p className="mt-2 text-sm text-stone-600">
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Sign in
          </Link>{" "}
          with the NGO account that started this project.
        </p>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-emerald-950">
          Only the owning NGO can manage this project
        </h1>
        <Link href={`/projects/${project.id}`}>
          <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">View the public page</Button>
        </Link>
      </main>
    );
  }

  const statusMeta = projectStatusMeta(project.status);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/ngo/projects"
        className="mb-4 inline-flex items-center text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        My projects
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-950">{project.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusMeta.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
            <span>{project.totalFilled} of {project.totalSlots} volunteers signed up</span>
            <span>Created {timeAgo(project.createdAt)}</span>
          </div>
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Public page
          </Button>
        </Link>
      </div>

      <Card className="mb-6 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <UserRound className="h-4 w-4" />
            Signed-up volunteers ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-stone-500">
              No volunteers yet. Share the project page link with your community.
            </p>
          ) : (
            <ul className="divide-y divide-emerald-100">
              {members.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-800">{member.name}</p>
                    <p className="truncate text-xs text-stone-500">
                      {member.email} · {member.roleTitle} · joined {timeAgo(member.joinedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={busyMember !== null}
                    onClick={() => removeMember(member)}
                  >
                    {busyMember === member.id ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : null}
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <h2 className="font-serif text-xl font-bold text-emerald-950">Edit project</h2>
      <p className="mb-4 mt-1 text-sm text-stone-600">
        Roles you shrink or remove are limited by how many volunteers have already signed up.
      </p>
      <ProjectForm
        isEdit
        initial={{
          title: project.title,
          description: project.description,
          category: project.category,
          address: project.location?.address || "",
          district: project.location?.district || "",
          state: project.location?.state || "",
          startsAt: project.startsAt || "",
          endsAt: project.endsAt || "",
          status: project.status,
          roles: project.roles.map((role) => ({
            _id: role.id,
            title: role.title,
            description: role.description || "",
            slots: role.slots,
          })),
        }}
        saving={saving}
        error={error}
        onSave={save}
      />
    </main>
  );
}
