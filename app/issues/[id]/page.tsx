"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  HandHeart,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Shield,
  Sparkles,
  ThumbsUp,
  Users,
  Wrench,
} from "lucide-react";
import { PublicHeader } from "@/components/issues/public-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { toast } from "@/hooks/use-toast";
import {
  categoryLabel,
  severityLabel,
  statusMeta,
  timeAgo,
} from "@/components/issues/issue-utils";

interface IssueDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  severity: number;
  status: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
    district?: string;
    state?: string;
  };
  media?: Array<{ dataUrl: string; mimeType: string }>;
  mediaCount?: number;
  aiValidation?: {
    isValid?: boolean;
    severity?: number;
    confidence?: number;
    impactType?: string;
    impactDescription?: string;
    shouldEscalate?: boolean;
    feedback?: string;
    suggestions?: string[];
    model?: string;
    validatedAt?: string;
  };
  confirmCount?: number;
  stillHappeningCount?: number;
  fixedCount?: number;
  duplicateCount?: number;
  escalated?: boolean;
  assignedNgo?: { id?: string; name?: string; email?: string };
  assignedDepartment?: string;
  assignedOfficial?: { id?: string; name?: string };
  reporter?: { id?: string; name?: string; role?: string };
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt?: string;
}

interface UpdateItem {
  _id: string;
  author?: { id?: string; name?: string; role?: string };
  type: string;
  body: string;
  fromStatus?: string;
  toStatus?: string;
  createdAt?: string;
}

const ROLE_LABELS: Record<string, string> = {
  government: "Government",
  ngo: "NGO",
  user: "Citizen",
  researcher: "Expert",
  system: "EcoSphere",
};

export default function IssueDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const [comment, setComment] = useState("");
  const [officialResponse, setOfficialResponse] = useState("");
  const [department, setDepartment] = useState("");
  const [statusTarget, setStatusTarget] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/issues/${id}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load this issue.");
      }
      setIssue(data.issue);
      setUpdates(data.updates || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Could not load this issue.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.department && !department) setDepartment(user.department);
  }, [user, department]);

  const act = async (key: string, url: string, body: Record<string, any>) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need an account to take this action. If you were already signed in, sign in again.",
        variant: "destructive",
      });
      return false;
    }

    setBusy(key);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Action failed.");
      }
      toast({ title: data.message || "Done" });
      await load();
      return true;
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <PublicHeader />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <PublicHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 font-serif text-2xl font-bold text-emerald-950">
            Issue not found
          </h1>
          <p className="mt-2 text-stone-600">{error}</p>
          <Link href="/issues">
            <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">
              Back to the issue board
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const meta = statusMeta(issue.status);
  const severity = severityLabel(issue.severity);
  const isGovernment = user?.role === "government";
  const isAssignedNgo =
    user?.role === "ngo" && issue.assignedNgo?.id === user.id;
  const isNgo = user?.role === "ngo";
  const hasCoordinates =
    typeof issue.location?.latitude === "number" &&
    typeof issue.location?.longitude === "number";

  const mapSrc = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        issue.location!.longitude! - 0.01
      },${issue.location!.latitude! - 0.01},${
        issue.location!.longitude! + 0.01
      },${issue.location!.latitude! + 0.01}&layer=mapnik&marker=${
        issue.location!.latitude
      },${issue.location!.longitude}`
    : "";

  const govStatuses = ["triaged", "assigned", "in_progress", "resolved", "rejected"];
  const ngoStatuses = ["in_progress", "resolved"];
  const statusChoices = isGovernment ? govStatuses : isAssignedNgo ? ngoStatuses : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/issues"
          className="mb-4 inline-flex items-center text-sm text-emerald-700 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to the public issue board
        </Link>

        {issue.escalated && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" />
            This issue has been escalated for urgent attention.
          </div>
        )}

        <Card className="mb-6 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.className}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              <Badge variant="outline">{categoryLabel(issue.category)}</Badge>
              <span className={`text-xs font-semibold ${severity.className}`}>
                {severity.label} severity · {issue.severity}/10
              </span>
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold text-emerald-950">
              {issue.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {issue.location?.address || "Location not specified"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Reported by {issue.reporter?.name || "a citizen"} · {timeAgo(issue.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {issue.confirmCount || 0} confirmations
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="font-serif text-lg">What was reported</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line text-sm leading-6 text-stone-700">
                  {issue.description}
                </p>

                {issue.media && issue.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {issue.media.map((item, index) => (
                      <a
                        key={index}
                        href={item.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-lg border border-emerald-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.dataUrl}
                          alt={`Evidence ${index + 1}`}
                          className="h-32 w-full object-cover transition hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {issue.aiValidation?.model && issue.aiValidation.model !== "none" && (
              <Card className="border-emerald-100 bg-emerald-50/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-lg">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Automatic assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={issue.aiValidation.isValid ? "default" : "secondary"}>
                      {issue.aiValidation.isValid ? "Plausible issue" : "Needs human review"}
                    </Badge>
                    <Badge variant="outline">
                      Confidence {issue.aiValidation.confidence || 0}/10
                    </Badge>
                    {issue.aiValidation.impactType && (
                      <Badge variant="outline">{issue.aiValidation.impactType}</Badge>
                    )}
                  </div>
                  {issue.aiValidation.impactDescription && (
                    <p className="text-stone-700">{issue.aiValidation.impactDescription}</p>
                  )}
                  {issue.aiValidation.feedback && (
                    <p className="text-stone-600">{issue.aiValidation.feedback}</p>
                  )}
                  {issue.aiValidation.suggestions && issue.aiValidation.suggestions.length > 0 && (
                    <ul className="list-disc space-y-1 pl-5 text-stone-600">
                      {issue.aiValidation.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-stone-400">
                    Automated analysis supports triage. It does not replace an official decision.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Community verification</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Button
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => act("confirm", `/api/issues/${id}/confirm`, { type: "confirm" })}
                  className="h-auto flex-col items-start gap-1 py-3"
                >
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <ThumbsUp className="h-4 w-4" /> I see this too
                  </span>
                  <span className="text-xs text-stone-500">{issue.confirmCount || 0} people</span>
                </Button>

                <Button
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() =>
                    act("still", `/api/issues/${id}/confirm`, { type: "still_happening" })
                  }
                  className="h-auto flex-col items-start gap-1 py-3"
                >
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <Clock className="h-4 w-4" /> Still happening
                  </span>
                  <span className="text-xs text-stone-500">
                    {issue.stillHappeningCount || 0} people
                  </span>
                </Button>

                <Button
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => act("fixed", `/api/issues/${id}/confirm`, { type: "fixed" })}
                  className="h-auto flex-col items-start gap-1 py-3"
                >
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Looks fixed
                  </span>
                  <span className="text-xs text-stone-500">{issue.fixedCount || 0} people</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <MessageSquare className="h-4 w-4" />
                  Timeline & discussion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {updates.length === 0 ? (
                  <p className="text-sm text-stone-500">No updates yet.</p>
                ) : (
                  <ol className="space-y-4">
                    {updates.map((update) => (
                      <li key={update._id} className="flex gap-3">
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          {update.type === "status_change" ? (
                            <ArrowRight className="h-3.5 w-3.5" />
                          ) : update.type === "official_response" ? (
                            <Shield className="h-3.5 w-3.5" />
                          ) : update.type === "verification" ? (
                            <BadgeCheck className="h-3.5 w-3.5" />
                          ) : update.type === "adoption" ? (
                            <HandHeart className="h-3.5 w-3.5" />
                          ) : (
                            <MessageSquare className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                            <span className="font-medium text-stone-700">
                              {update.author?.name || "EcoSphere"}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {ROLE_LABELS[update.author?.role || "system"] || update.author?.role}
                            </Badge>
                            <span>{timeAgo(update.createdAt)}</span>
                          </div>
                          <p className="mt-1 whitespace-pre-line text-sm text-stone-700">
                            {update.body}
                          </p>
                          {update.fromStatus && update.toStatus && (
                            <p className="mt-1 text-xs text-emerald-700">
                              Status: {statusMeta(update.fromStatus).label} →{" "}
                              {statusMeta(update.toStatus).label}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="border-t border-emerald-100 pt-4">
                  <Textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder={
                      user
                        ? "Add information, local context, or ask a question..."
                        : "Sign in to join the discussion."
                    }
                    disabled={!user || busy !== null}
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      disabled={!user || !comment.trim() || busy !== null}
                      onClick={async () => {
                        const ok = await act("comment", `/api/issues/${id}/updates`, {
                          type: "comment",
                          body: comment,
                        });
                        if (ok) setComment("");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {busy === "comment" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Post comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Who is handling this</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-stone-800">Government</p>
                    <p className="text-stone-500">
                      {issue.assignedDepartment
                        ? `${issue.assignedDepartment}${issue.assignedOfficial?.name ? ` · ${issue.assignedOfficial.name}` : ""}`
                        : "Not yet acknowledged"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <HandHeart className="mt-0.5 h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-stone-800">Implementing NGO</p>
                    <p className="text-stone-500">
                      {issue.assignedNgo?.name || "No NGO has adopted this issue yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium text-stone-800">Reported</p>
                    <p className="text-stone-500">{timeAgo(issue.createdAt)}</p>
                  </div>
                </div>
                {issue.acknowledgedAt && (
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-stone-800">Acknowledged</p>
                      <p className="text-stone-500">{timeAgo(issue.acknowledgedAt)}</p>
                    </div>
                  </div>
                )}
                {issue.resolvedAt && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-stone-800">Resolved</p>
                      <p className="text-stone-500">{timeAgo(issue.resolvedAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Take action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user && (
                  <p className="text-sm text-stone-600">
                    <Link href="/login" className="font-medium text-emerald-700 hover:underline">
                      Sign in
                    </Link>{" "}
                    to confirm, comment, adopt, or triage this issue.
                  </p>
                )}

                {isGovernment && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-stone-600">
                        Department
                      </label>
                      <Input
                        value={department}
                        onChange={(event) => setDepartment(event.target.value)}
                        placeholder="e.g. Municipal Solid Waste"
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={busy !== null}
                      onClick={() =>
                        act("triage", `/api/issues/${id}/assign`, {
                          action: "triage",
                          department,
                        })
                      }
                    >
                      {busy === "triage" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Shield className="mr-2 h-4 w-4" />
                      )}
                      Acknowledge & route
                    </Button>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-stone-600">
                        Update status
                      </label>
                      <select
                        value={statusTarget}
                        onChange={(event) => setStatusTarget(event.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Choose a status...</option>
                        {govStatuses.map((value) => (
                          <option key={value} value={value}>
                            {statusMeta(value).label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        className="mt-2 w-full"
                        disabled={!statusTarget || busy !== null}
                        onClick={() =>
                          act("status", `/api/issues/${id}/updates`, {
                            type: "status_change",
                            toStatus: statusTarget,
                          })
                        }
                      >
                        {busy === "status" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Wrench className="mr-2 h-4 w-4" />
                        )}
                        Save status
                      </Button>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-stone-600">
                        Official response
                      </label>
                      <Textarea
                        value={officialResponse}
                        onChange={(event) => setOfficialResponse(event.target.value)}
                        rows={3}
                        placeholder="What is being done, and by when?"
                      />
                      <Button
                        variant="outline"
                        className="mt-2 w-full"
                        disabled={!officialResponse.trim() || busy !== null}
                        onClick={async () => {
                          const ok = await act("official", `/api/issues/${id}/updates`, {
                            type: "official_response",
                            body: officialResponse,
                          });
                          if (ok) setOfficialResponse("");
                        }}
                      >
                        {busy === "official" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Post official response
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={busy !== null || issue.escalated}
                      onClick={() => act("escalate", `/api/issues/${id}/assign`, { action: "escalate" })}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      {issue.escalated ? "Already escalated" : "Escalate"}
                    </Button>
                  </div>
                )}

                {isNgo && !isAssignedNgo && (
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={busy !== null}
                    onClick={() => act("adopt", `/api/issues/${id}/assign`, { action: "adopt" })}
                  >
                    {busy === "adopt" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <HandHeart className="mr-2 h-4 w-4" />
                    )}
                    Adopt this issue
                  </Button>
                )}

                {isAssignedNgo && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-800">
                      Your organisation is handling this issue.
                    </p>
                    <Link href={`/ngo/projects/new?fromIssue=${issue._id}`}>
                      <Button
                        variant="outline"
                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <HandHeart className="mr-2 h-4 w-4" />
                        Start a volunteer project from this issue
                      </Button>
                    </Link>
                    <select
                      value={statusTarget}
                      onChange={(event) => setStatusTarget(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Choose a status...</option>
                      {ngoStatuses.map((value) => (
                        <option key={value} value={value}>
                          {statusMeta(value).label}
                        </option>
                      ))}
                    </select>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={!statusTarget || busy !== null}
                      onClick={() =>
                        act("status", `/api/issues/${id}/updates`, {
                          type: "status_change",
                          toStatus: statusTarget,
                        })
                      }
                    >
                      Update status
                    </Button>
                  </div>
                )}

                {user && !isGovernment && !isNgo && (
                  <p className="text-sm text-stone-600">
                    You can confirm this issue and add context. NGOs can adopt it, and government
                    officials can acknowledge and route it.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-stone-700">{issue.location?.address || "Not specified"}</p>
                {(issue.location?.district || issue.location?.state) && (
                  <p className="text-stone-500">
                    {[issue.location?.district, issue.location?.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {mapSrc && (
                  <iframe
                    title="Issue location"
                    src={mapSrc}
                    className="h-56 w-full rounded-lg border border-emerald-100"
                    loading="lazy"
                  />
                )}
                {hasCoordinates && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${issue.location!.latitude}&mlon=${issue.location!.longitude}#map=16/${issue.location!.latitude}/${issue.location!.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs font-medium text-emerald-700 hover:underline"
                  >
                    Open in OpenStreetMap
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
