"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bird,
  Building2,
  Clock,
  Droplets,
  Factory,
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
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  categoryLabel,
  severityLabel,
  statusMeta,
  timeAgo,
} from "@/components/issues/issue-utils";

export type IssueFeedMode = "public" | "triage" | "adopt" | "ngo";

interface IssueFeedProps {
  mode?: IssueFeedMode;
}

interface IssueListItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  severity: number;
  status: string;
  reporter?: { name?: string };
  acknowledgedAt?: string | null;
  location?: { address?: string; district?: string; state?: string };
  mediaCount?: number;
  confirmCount?: number;
  duplicateCount?: number;
  escalated?: boolean;
  assignedNgo?: { name?: string };
  assignedDepartment?: string;
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, typeof Droplets> = {
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

const MODE_DEFAULTS: Record<IssueFeedMode, { status: string; sort: string; title: string; subtitle: string }> = {
  public: {
    status: "",
    sort: "newest",
    title: "Public Issue Board",
    subtitle:
      "Every environmental report, in the open. See what citizens have reported, what is verified, and who is handling it.",
  },
  triage: {
    status: "reported,verified,triaged",
    sort: "severity",
    title: "Citizen Issue Queue",
    subtitle:
      "Acknowledge reports, route them to a department, or escalate them. Every action is visible on the public board.",
  },
  adopt: {
    status: "verified,triaged",
    sort: "confirmed",
    title: "Issues to Take Up",
    subtitle:
      "Verified problems that still need an implementing partner. Adopt one and it becomes your project.",
  },
  ngo: {
    status: "",
    sort: "newest",
    title: "Community Issues",
    subtitle:
      "Every issue reported by the community - whether the government has taken it up or not. Issues moved forward by the government carry a 'With govt' tag; the rest are labelled with the reporting citizen.",
  },
};

export function IssueFeed({ mode = "public" }: IssueFeedProps) {
  const defaults = MODE_DEFAULTS[mode];
  const { user } = useAuth();

  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState(defaults.status);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState(defaults.sort);
  const [mine, setMine] = useState(false);
  const [adopted, setAdopted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (sort) params.set("sort", sort);
    if (mine) params.set("mine", "1");
    if (adopted) params.set("adopted", "1");
    params.set("limit", "60");
    return params.toString();
  }, [status, category, debouncedSearch, sort, mine, adopted]);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/issues?${queryString}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load issues.");
      }
      setIssues(data.issues || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Could not load issues.");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const showMine = mode === "public" && user;
  const showAdopted = mode === "adopt" && user?.role === "ngo";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-950">{defaults.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">{defaults.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mode === "public" && (
            <Link href="/report-issue">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report an issue
              </Button>
            </Link>
          )}
          {mode === "triage" && (
            <Link href="/issues">
              <Button variant="outline">View public board</Button>
            </Link>
          )}
          {mode === "adopt" && (
            <Link href="/issues">
              <Button variant="outline">Browse all issues</Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-emerald-100">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, description or place..."
              className="pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
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
            {CATEGORY_OPTIONS.map((option) => (
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
            <option value="confirmed">Most confirmed</option>
            <option value="severity">Most severe</option>
          </select>

          {showMine && (
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={mine}
                onChange={(event) => setMine(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              My reports
            </label>
          )}

          {showAdopted && (
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={adopted}
                onChange={(event) => setAdopted(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Adopted by me
            </label>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          {loading ? "Loading..." : `${total} issue${total === 1 ? "" : "s"}`}
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
      ) : issues.length === 0 ? (
        <Card className="border-dashed border-emerald-200">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-emerald-300" />
            <p className="font-medium text-emerald-900">No issues match these filters</p>
            <p className="max-w-sm text-sm text-stone-500">
              Try clearing the filters, or be the first to report a problem in your area.
            </p>
            <Link href="/report-issue">
              <Button variant="outline">Report an issue</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {issues.map((issue) => {
            const Icon = CATEGORY_ICONS[issue.category] || AlertTriangle;
            const meta = statusMeta(issue.status);
            const severity = severityLabel(issue.severity);
            const withGovt =
              mode === "ngo" &&
              Boolean(
                issue.acknowledgedAt ||
                  issue.assignedDepartment ||
                  ["triaged", "assigned", "in_progress", "resolved"].includes(
                    issue.status
                  )
              );

            return (
              <Link key={issue._id} href={`/issues/${issue._id}`} className="group">
                <Card className="h-full border-emerald-100 transition hover:border-emerald-300 hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                            {categoryLabel(issue.category)}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                            {mode === "ngo" &&
                              (withGovt ? (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                                  title="Government has acknowledged/routed this issue"
                                >
                                  <Building2 className="h-3 w-3" />
                                  With govt
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700"
                                  title="Reported by a community member; government has not taken it up yet"
                                >
                                  <Users className="h-3 w-3" />
                                  Reported by {issue.reporter?.name || "community member"}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${severity.className}`}>
                        {severity.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-semibold text-emerald-950 group-hover:underline">
                        {issue.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-600">{issue.description}</p>
                    </div>

                    <div className="mt-auto space-y-2 text-xs text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{issue.location?.address || "Location not specified"}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {issue.confirmCount || 0} confirmed
                          {(issue.duplicateCount || 0) > 0 ? ` · ${issue.duplicateCount} similar` : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {timeAgo(issue.createdAt)}
                        </span>
                        {issue.escalated && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-700">
                            Escalated
                          </span>
                        )}
                      </div>
                      {issue.assignedNgo?.name && (
                        <p className="text-purple-700">Handled by {issue.assignedNgo.name}</p>
                      )}
                      {issue.assignedDepartment && (
                        <p className="text-blue-700">Routed to {issue.assignedDepartment}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-1 text-xs font-medium text-emerald-700">
                      {mode === "adopt"
                        ? "Adopt this issue"
                        : mode === "ngo"
                          ? "View & adopt"
                          : "View details"}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
