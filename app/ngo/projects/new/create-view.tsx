"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { toast } from "@/hooks/use-toast";
import { categoryLabel } from "@/components/issues/issue-utils";
import { ProjectForm, type ProjectFormValues } from "@/components/projects/project-form";

export function CreateProjectView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromIssue = searchParams.get("fromIssue") || "";
  const { user } = useAuth();

  const [prefill, setPrefill] = useState<Partial<ProjectFormValues> | null>(null);
  const [linkedIssue, setLinkedIssue] = useState<{
    id: string;
    title: string;
    category: string;
  } | null>(null);
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadLinkedIssue = useCallback(async () => {
    if (!fromIssue) return;
    setLoadingPrefill(true);
    try {
      const response = await fetch(`/api/issues/${fromIssue}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load the linked issue.");
      }
      const issue = data.issue;
      setPrefill({
        title: issue.title || "",
        description: issue.description || "",
        category: issue.category || "other",
        address: issue.location?.address || "",
        district: issue.location?.district || "",
        state: issue.location?.state || "",
        roles: [{ title: "Field volunteer", description: "", slots: "" }],
      });
      setLinkedIssue({ id: fromIssue, title: issue.title || "", category: issue.category || "" });
    } catch (err: any) {
      toast({
        title: "Could not pre-fill from that issue",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingPrefill(false);
    }
  }, [fromIssue]);

  useEffect(() => {
    loadLinkedIssue();
  }, [loadLinkedIssue]);

  const save = async (values: ProjectFormValues) => {
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, any> = {
        title: values.title,
        description: values.description,
        category: values.category,
        referralId: values.referralId,
        roles: values.roles,
        location: {
          address: values.address,
          district: values.district,
          state: values.state,
        },
        startsAt: values.startsAt || undefined,
        endsAt: values.endsAt || undefined,
      };
      if (linkedIssue) payload.issueIds = [linkedIssue.id];

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not publish the project.");
      }
      toast({ title: "Project published", description: data.message });
      router.push(data.projectUrl || "/projects");
    } catch (err: any) {
      setError(err.message || "Could not publish the project.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-emerald-950">Sign in required</h1>
        <p className="mt-2 text-sm text-stone-600">
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Sign in
          </Link>{" "}
          with an NGO account to start a project.
        </p>
      </main>
    );
  }

  if (user.role !== "ngo") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-emerald-950">
          Only NGOs can start projects
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          You are signed in as a {user.role} account. Browse the{" "}
          <Link href="/projects" className="font-medium text-emerald-700 hover:underline">
            volunteer board
          </Link>{" "}
          instead.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/ngo/projects"
        className="mb-4 inline-flex items-center text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        My projects
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-emerald-950">Start a volunteer project</h1>
        <p className="mt-1 text-sm text-stone-600">
          Your project goes live on the public volunteer board immediately - no approval wait.
        </p>
      </div>

      {linkedIssue && (
        <Card className="mb-6 border-emerald-100 bg-emerald-50/60">
          <CardContent className="flex items-start gap-3 p-4">
            <Search className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-900">
                Linked to issue &quot;{linkedIssue.title}&quot;
              </p>
              <p className="text-xs text-stone-600">
                Category {categoryLabel(linkedIssue.category)} · volunteers will see this report
                linked on your project page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loadingPrefill ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <ProjectForm initial={prefill || undefined} saving={saving} error={error} onSave={save} />
      )}
    </main>
  );
}
