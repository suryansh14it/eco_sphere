"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  HandCoins,
  Landmark,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/components/auth-provider";
import { PROJECT_CATEGORY_OPTIONS } from "@/components/projects/project-utils";
import {
  RazorpayCheckout,
  parseRupees,
  formatRupees,
} from "@/components/government/razorpay-checkout";

type GovRequest = {
  _id: string;
  title: string;
  description: string;
  location: string;
  department: string;
  projectFunding: string;
  timeline: string;
  ngoName: string;
  ngoEmail: string;
  ngoCommission: string;
  /** UPI VPA the NGO provided for receiving payment. */
  upiId?: string;
  proposalSummary: string;
  expectedImpact?: string;
  implementationPlan?: string;
  expectedStartDate?: string;
  teamSize?: string;
  experienceLevel?: string;
  additionalNotes?: string;
  additionalNotesText?: string;
  submittedAt: string;
  status: "submitted" | "approved" | "funded";
  approvedFunding?: string;
  approvedNote?: string;
  approvedByGov?: { id: string; name: string };
  approvedAt?: string | null;
  paymentStatus: "pending" | "completed";
  paymentRef?: string;
  fundedAt?: string | null;
  volunteerCount: number;
  volunteers: { id: string; name: string; roleTitle: string; joinedAt: string }[];
  project: { id: string; status: string; progress: number; completedAt?: string | null; completedSummary?: string } | null;
  workEvidence: {
    media: { kind: string; url: string }[];
    documents: { title: string; url?: string }[];
    mediaCount: number;
    documentCount: number;
  };
};

type NgoDirectoryEntry = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  registrationNumber: string;
  focusAreas: string[];
  memberSince: string;
  totals: { projects: number; open: number; completed: number; volunteers: number; fundingRequests: number; requestsPending: number };
  projects: { id: string; title: string; status: string; volunteers: number }[];
  fundingRequests: { id: string; title: string; status: string; funding: string; submittedAt: string }[];
};

type CompletedProject = {
  id: string;
  key: string;
  title: string;
  description: string;
  category: string;
  organisation: string;
  location: string;
  completedAt: string | null;
  completedSummary: string;
  progress: number;
  media: { kind: string; url: string; name?: string }[];
  documents: { title: string; url?: string }[];
  participants: { id: string; name: string; email: string }[];
  attendanceDates: string[];
};

type GovProject = {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: { address?: string; district?: string; state?: string } | null;
  status: string;
  roles: { id: string; title: string; slots: number; filled: number }[];
  totalSlots: number;
  totalFilled: number;
  createdAt?: string;
};

const dateLabel = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

const STATUS_META: Record<string, { label: string; badge: string }> = {
  open: { label: "Open for volunteers", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  completed: { label: "Completed", badge: "bg-green-100 text-green-800 border-green-300" },
  closed: { label: "Completed", badge: "bg-green-100 text-green-800 border-green-300" },
};

export default function GovernmentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loadError, setLoadError] = useState("");

  // ---- real data ----
  const [requests, setRequests] = useState<GovRequest[]>([]);
  const [ngos, setNgos] = useState<NgoDirectoryEntry[]>([]);
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([]);
  const [govProjects, setGovProjects] = useState<GovProject[]>([]);
  const [govManagedLive, setGovManagedLive] = useState<any[]>([]);
  const [govManagedCompleted, setGovManagedCompleted] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ---- detail dialogs ----
  const [detailRequest, setDetailRequest] = useState<GovRequest | null>(null);
  const [detailCompleted, setDetailCompleted] = useState<CompletedProject | null>(null);
  const [expandedNgo, setExpandedNgo] = useState<string | null>(null);

  // ---- funding review action state ----
  const [approvedInputs, setApprovedInputs] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [acting, setActing] = useState(false);
  const [payModalRequest, setPayModalRequest] = useState<GovRequest | null>(null);

  // ---- create project form ----
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formState, setFormState] = useState("");
  const [formRoles, setFormRoles] = useState([{ title: "", slots: "" }]);
  const [creating, setCreating] = useState(false);

  // Redirect non-government roles.
  useEffect(() => {
    if (!loading && user && user.role !== "government") {
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setLoadError("");
    try {
      const [reqRes, dirRes, compRes, projRes, manRes] = await Promise.all([
        fetch("/api/government/funding-requests", { credentials: "include" }),
        fetch("/api/government/ngo-directory", { credentials: "include" }),
        fetch("/api/government/completed-projects", { credentials: "include" }),
        fetch("/api/government/projects", { credentials: "include" }),
        fetch("/api/ngo/managed-projects", { credentials: "include" }),
      ]);
      const [reqData, dirData, compData, projData, manData] = await Promise.all([
        reqRes.json(),
        dirRes.json(),
        compRes.json(),
        projRes.json(),
        manRes.json(),
      ]);
      if (reqRes.ok && reqData.success) setRequests(reqData.requests || []);
      if (dirRes.ok && dirData.success) setNgos(dirData.ngos || []);
      if (compRes.ok && compData.success) setCompletedProjects(compData.completed || []);
      if (projRes.ok && projData.success) setGovProjects(projData.projects || []);
      if (manRes.ok && manData.success) {
        setGovManagedLive(manData.live || []);
        setGovManagedCompleted(manData.completed || []);
      }
      if (!reqRes.ok || !reqData.success) {
        setLoadError(reqData.message || "Could not load dashboard data.");
      }
    } catch (e) {
      console.error("gov dashboard load error:", e);
      setLoadError("Could not load dashboard data.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user?.role === "government") loadAll();
  }, [user, loading, loadAll]);

  // ---- derived buckets ----
  const pendingConfirm = useMemo(() => requests.filter((r) => r.status === "submitted"), [requests]);
  const pendingPayment = useMemo(
    () => requests.filter((r) => r.status === "approved" && r.paymentStatus === "pending"),
    [requests]
  );
  const fundedRequests = useMemo(
    () => requests.filter((r) => r.status === "funded" || r.paymentStatus === "completed"),
    [requests]
  );
  const ongoingFunded = useMemo(
    () => fundedRequests.filter((r) => r.project && r.project.status !== "completed"),
    [fundedRequests]
  );
  // Ongoing count = paid NGO projects still running + the government's own
  // created projects that are live in their workspaces.
  const ongoingCount = ongoingFunded.length + govManagedLive.length;
  const totalVolunteers = useMemo(
    () => ngos.reduce((sum, n) => sum + (n.totals?.volunteers || 0), 0),
    [ngos]
  );
  const approvedMoney = useMemo(
    () =>
      fundedRequests.reduce((sum, r) => {
        const n = parseFloat((r.approvedFunding || r.projectFunding || "").replace(/[₹,CrL ]/g, "")) || 0;
        return sum + n;
      }, 0),
    [fundedRequests]
  );

  // ---- actions ----
  const act = async (payload: Record<string, unknown>, requestId: string) => {
    setActing(true);
    try {
      const res = await fetch("/api/government/funding-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Done.");
        setDetailRequest(null);
        await loadAll();
      } else {
        toast.error(data.message || "Action failed.");
      }
    } catch (e) {
      toast.error("Action failed.");
    } finally {
      setActing(false);
    }
  };

  const createProject = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    const roles = formRoles
      .map((r) => ({ title: r.title.trim(), slots: Number(r.slots) }))
      .filter((r) => r.title);
    if (roles.length === 0) {
      toast.error("Add at least one volunteer role with openings.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/government/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          location: { address: formAddress.trim(), district: formDistrict.trim(), state: formState.trim() },
          roles,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Project created.");
        setFormTitle("");
        setFormDescription("");
        setFormCategory("");
        setFormAddress("");
        setFormDistrict("");
        setFormState("");
        setFormRoles([{ title: "", slots: "" }]);
        await loadAll();
      } else {
        toast.error(data.message || "Could not create the project.");
      }
    } catch (e) {
      toast.error("Could not create the project.");
    } finally {
      setCreating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  const sectionTitle: Record<string, string> = {
    "ngo-requested": "NGO Requested",
    approved: "Approved Projects",
    ongoing: "Ongoing Projects",
    completed: "Completed Projects",
    "gov-projects": "Government Projects",
    "create-project": "Create Project",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white font-serif font-bold">
              ₹
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-sky-950">Government Hub</h1>
              <p className="text-xs text-muted-foreground">
                {user.department || "Government"} · {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="min-h-screen w-64 border-r border-sky-100 bg-white">
          <nav className="space-y-1 p-3">
            <Button
              variant={activeSection === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "dashboard" ? "bg-sky-600 text-white hover:bg-sky-700" : "hover:bg-sky-50"
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              <ClipboardList className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Link href="/government/issues">
              <Button variant="ghost" className="w-full justify-start hover:bg-sky-50">
                <FileText className="mr-3 h-4 w-4" />
                Citizen Reports
              </Button>
            </Link>
            <Button
              variant={activeSection === "ngo-requested" ? "default" : "ghost"}
              className={`w-full justify-between ${
                activeSection === "ngo-requested" ? "bg-sky-600 text-white hover:bg-sky-700" : "hover:bg-sky-50"
              }`}
              onClick={() => setActiveSection("ngo-requested")}
            >
              <span className="flex items-center">
                <HandCoins className="mr-3 h-4 w-4" />
                NGO Requested
              </span>
              {pendingConfirm.length + pendingPayment.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {pendingConfirm.length + pendingPayment.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeSection === "approved" ? "default" : "ghost"}
              className={`w-full justify-between ${
                activeSection === "approved" ? "bg-sky-600 text-white hover:bg-sky-700" : "hover:bg-sky-50"
              }`}
              onClick={() => setActiveSection("approved")}
            >
              <span className="flex items-center">
                <BadgeCheck className="mr-3 h-4 w-4" />
                Approved
              </span>
              {fundedRequests.length > 0 && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                  {fundedRequests.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeSection === "ongoing" ? "default" : "ghost"}
              className={`w-full justify-between ${
                activeSection === "ongoing" ? "bg-sky-600 text-white hover:bg-sky-700" : "hover:bg-sky-50"
              }`}
              onClick={() => setActiveSection("ongoing")}
            >
              <span className="flex items-center">
                <Clock className="mr-3 h-4 w-4" />
                Ongoing
              </span>
              {ongoingCount > 0 && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                  {ongoingCount}
                </span>
              )}
            </Button>
            <Button
              variant={activeSection === "completed" ? "default" : "ghost"}
              className={`w-full justify-between ${
                activeSection === "completed" ? "bg-sky-600 text-white hover:bg-sky-700" : "hover:bg-sky-50"
              }`}
              onClick={() => setActiveSection("completed")}
            >
              <span className="flex items-center">
                <CheckCircle2 className="mr-3 h-4 w-4" />
                Completed
              </span>
              {completedProjects.length > 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                  {completedProjects.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeSection === "gov-projects" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "gov-projects"
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "hover:bg-sky-50"
              }`}
              onClick={() => setActiveSection("gov-projects")}
            >
              <Landmark className="mr-3 h-4 w-4" />
              Government Projects
            </Button>
            <Button
              variant={activeSection === "create-project" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "create-project"
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "hover:bg-sky-50"
              }`}
              onClick={() => setActiveSection("create-project")}
            >
              <Plus className="mr-3 h-4 w-4" />
              Create Project
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {/* ================= Dashboard ================= */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {sectionHeaderPrompt("dashboard")}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="NGO requests to review"
                  value={pendingConfirm.length + pendingPayment.length}
                  note={
                    pendingConfirm.length
                      ? `${pendingConfirm.length} awaiting confirmation`
                      : "Nothing awaiting confirmation"
                  }
                  color="text-amber-600"
                  icon={<Clock className="h-6 w-6" />}
                />
                <StatCard
                  label="Approved & paid"
                  value={fundedRequests.length}
                  note={`₹${approvedMoney.toFixed(2)}Cr approved in funding`}
                  color="text-sky-600"
                  icon={<BadgeCheck className="h-6 w-6" />}
                />
                <StatCard
                  label="Completed projects"
                  value={completedProjects.length}
                  note={`${completedProjects.reduce((s, c) => s + c.participants.length, 0)} volunteers took part`}
                  color="text-green-600"
                  icon={<CheckCircle2 className="h-6 w-6" />}
                />
                <StatCard
                  label="Community volunteers"
                  value={totalVolunteers}
                  note={`across ${ngos.reduce((s, n) => s + n.totals.projects, 0)} NGO projects`}
                  color="text-emerald-600"
                  icon={<Users className="h-6 w-6" />}
                />
              </div>

              {/* NGO directory */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg">Registered NGOs & Their Work</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Click an NGO to see the projects it runs, its volunteers and its funding requests.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent" onClick={loadAll} disabled={dataLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${dataLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dataLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                    </div>
                  ) : ngos.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No NGOs registered yet.</p>
                  ) : (
                    ngos.map((ngo) => (
                      <div key={ngo.id} className="rounded-lg border border-sky-100 bg-white">
                        <button
                          className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-sky-50/60"
                          onClick={() => setExpandedNgo(expandedNgo === ngo.id ? null : ngo.id)}
                        >
                          <div>
                            <h4 className="font-semibold text-sky-950">{ngo.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {ngo.contactName} · {ngo.email}
                              {ngo.registrationNumber ? ` · Reg ${ngo.registrationNumber}` : ""} · member since{" "}
                              {dateLabel(ngo.memberSince)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ClipboardList className="h-3.5 w-3.5" />
                              {ngo.totals.projects} project{ngo.totals.projects === 1 ? "" : "s"}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Users className="h-3.5 w-3.5" />
                              {ngo.totals.volunteers} volunteer{ngo.totals.volunteers === 1 ? "" : "s"}
                            </span>
                            <span className="flex items-center gap-1 text-sky-700">
                              <HandCoins className="h-3.5 w-3.5" />
                              {ngo.totals.fundingRequests} funding request
                              {ngo.totals.fundingRequests === 1 ? "" : "s"}
                            </span>
                            <span className="flex items-center gap-1 text-green-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {ngo.totals.completed} completed
                            </span>
                            {expandedNgo === ngo.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </button>

                        {expandedNgo === ngo.id && (
                          <div className="grid gap-4 border-t border-sky-100 bg-slate-50/60 p-4 md:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                                Projects
                              </p>
                              {ngo.projects.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No projects posted yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {ngo.projects.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
                                      <div>
                                        <p className="font-medium">{p.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {p.volunteers} volunteer{p.volunteers === 1 ? "" : "s"} joined
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={
                                          p.status === "completed"
                                            ? "bg-green-100 text-green-800 border-green-300"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        }
                                      >
                                        {p.status === "completed" ? "Completed" : "Open"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                                Funding requests
                              </p>
                              {ngo.fundingRequests.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No funding requests made.</p>
                              ) : (
                                <div className="space-y-2">
                                  {ngo.fundingRequests.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
                                      <div>
                                        <p className="font-medium">{r.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          requested {r.funding} · {dateLabel(r.submittedAt)}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={
                                          r.status === "funded"
                                            ? "bg-sky-100 text-sky-800 border-sky-300"
                                            : r.status === "approved"
                                              ? "bg-amber-100 text-amber-800 border-amber-300"
                                              : "bg-stone-100 text-stone-700 border-stone-200"
                                        }
                                      >
                                        {r.status === "funded" ? "Approved & paid" : r.status === "approved" ? "Payment pending" : "Awaiting review"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Latest NGO requests preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Latest NGO Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingConfirm.length + pendingPayment.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No pending NGO requests. Everything submitted has been reviewed.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {[...pendingConfirm, ...pendingPayment].slice(0, 5).map((r) => (
                        <div
                          key={r._id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-100 bg-white px-4 py-3 hover:bg-sky-50/60"
                        >
                          <div>
                            <h4 className="font-medium">{r.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {r.ngoName} · {r.projectFunding} · {dateLabel(r.submittedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                r.status === "approved"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-stone-100 text-stone-700 border-stone-200"
                              }
                            >
                              {r.status === "approved" ? "Payment pending" : "Awaiting confirmation"}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveSection("ngo-requested");
                                setDetailRequest(r);
                              }}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ================= NGO Requested ================= */}
          {activeSection === "ngo-requested" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-sky-950">NGO Requested</h2>
                <p className="text-sm text-muted-foreground">
                  Funding requests made by NGOs. Confirm and fix funding, then release the payment —
                  approved requests move to Approved once payment is complete.
                </p>
              </div>

              {dataLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
                </div>
              ) : pendingConfirm.length + pendingPayment.length === 0 ? (
                <Card>
                  <CardContent className="py-14 text-center">
                    <HandCoins className="mx-auto mb-3 h-10 w-10 text-sky-200" />
                    <p className="font-medium">No requests to review</p>
                    <p className="text-sm text-muted-foreground">
                      NGO funding requests land here with evidence of the volunteers already signed up.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                [...pendingConfirm, ...pendingPayment].map((r) => (
                  <Card key={r._id} className="border-sky-100">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-sky-950">{r.title}</h3>
                            <Badge
                              variant="outline"
                              className={
                                r.status === "approved"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-stone-100 text-stone-700 border-stone-200"
                              }
                            >
                              {r.status === "approved" ? "Approved — payment pending" : "Pending confirmation"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{r.ngoName}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {r.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              Requested {r.projectFunding}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {r.department}
                            </span>
                            {r.volunteerCount > 0 && (
                              <span className="flex items-center gap-1 font-medium text-emerald-700">
                                <Users className="h-3.5 w-3.5" />
                                {r.volunteerCount} volunteer{r.volunteerCount === 1 ? "" : "s"} joined
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              submitted {dateLabel(r.submittedAt)}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-sky-600 hover:bg-sky-700 text-white"
                          onClick={() => setDetailRequest(r)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ================= Approved ================= */}
          {activeSection === "approved" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-sky-950">Approved Projects</h2>
                <p className="text-sm text-muted-foreground">
                  NGO projects whose funding the government approved and paid. The NGO's project
                  photos, documentation and funding details are shown on each card.
                </p>
              </div>
              {dataLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
                </div>
              ) : fundedRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-14 text-center">
                    <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-sky-200" />
                    <p className="font-medium">Nothing approved yet</p>
                    <p className="text-sm text-muted-foreground">
                      Approve a request in NGO Requested and release its payment to move it here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {fundedRequests.map((r) => (
                    <Card key={r._id} className="border-sky-100">
                      <CardContent className="p-5">
                        {r.workEvidence.media.length > 0 && (
                          <div className="mb-3 flex gap-2 overflow-x-auto">
                            {r.workEvidence.media.slice(0, 3).map((m, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={m.url}
                                alt=""
                                className="h-20 w-28 shrink-0 rounded-md object-cover"
                              />
                            ))}
                          </div>
                        )}
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sky-950">{r.title}</h3>
                          <Badge className="bg-sky-100 text-sky-800 border-sky-300">Approved & paid</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.ngoName}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-md bg-sky-50 px-2.5 py-1.5">
                            <span className="text-muted-foreground">Approved funding</span>
                            <p className="font-semibold text-sky-800">{r.approvedFunding || r.projectFunding}</p>
                          </div>
                          <div className="rounded-md bg-sky-50 px-2.5 py-1.5">
                            <span className="text-muted-foreground">Payment</span>
                            <p className="font-semibold text-sky-800">
                              {r.fundedAt ? `Released ${dateLabel(r.fundedAt)}` : "Completed"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {r.volunteerCount > 0 && (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Users className="h-3.5 w-3.5" />
                              {r.volunteerCount} volunteers
                            </span>
                          )}
                          {r.workEvidence.mediaCount > 0 && (
                            <span>📷 {r.workEvidence.mediaCount} photos/videos</span>
                          )}
                          {r.workEvidence.documentCount > 0 && (
                            <span>📄 {r.workEvidence.documentCount} documents</span>
                          )}
                          {r.project && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5" />
                              progress {r.project.progress}%
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full bg-transparent"
                          onClick={() => setDetailRequest(r)}
                        >
                          View full details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= Ongoing ================= */}
          {activeSection === "ongoing" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-sky-950">Ongoing Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Paid NGO projects and the government's own projects that are still running, with
                  the progress reported from the management workspaces.
                </p>
              </div>
              {dataLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
                </div>
              ) : ongoingFunded.length === 0 && govManagedLive.length === 0 ? (
                <Card>
                  <CardContent className="py-14 text-center">
                    <Clock className="mx-auto mb-3 h-10 w-10 text-sky-200" />
                    <p className="font-medium">No ongoing projects</p>
                    <p className="text-sm text-muted-foreground">
                      Paid projects still in execution — NGO-funded or government-own — show their
                      progress here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {ongoingFunded.map((r) => (
                    <Card key={`req-${r._id}`} className="border-sky-100">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-sky-950">{r.title}</h3>
                              <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                                In progress
                              </Badge>
                              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                <HandCoins className="mr-1 h-3 w-3" />
                                Paid via Razorpay
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {r.ngoName} · payment {r.approvedFunding || r.projectFunding}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="bg-transparent" onClick={() => setDetailRequest(r)}>
                            View Details
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 rounded-full bg-sky-100">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                              style={{ width: `${r.project?.progress ?? 0}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-sm font-semibold text-sky-700">
                            {r.project?.progress ?? 0}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {govManagedLive.length > 0 && (
                    <>
                      <h3 className="pt-2 font-serif text-lg font-semibold text-sky-900">
                        Government-run projects
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {govManagedLive.map((p) => (
                          <Card key={p.key} className="border-sky-100">
                            <CardContent className="p-5">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-sky-950">{p.title}</h3>
                                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                                  In progress
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <MapPin className="mr-1 inline h-3 w-3" />
                                {p.location}
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1 rounded-full bg-sky-100">
                                  <div
                                    className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                                    style={{ width: `${p.progress}%` }}
                                  />
                                </div>
                                <span className="w-12 text-right text-sm font-semibold text-sky-700">
                                  {p.progress}%
                                </span>
                              </div>
                              <p className="mt-3 text-xs text-muted-foreground">
                                {p.memberCount} participant{p.memberCount === 1 ? "" : "s"} · {p.media?.length || 0} media
                              </p>
                              <div className="mt-3 flex gap-2">
                                <Link href={`/government/project-management/${p.key}`} className="flex-1">
                                  <Button size="sm" className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                                    Manage
                                  </Button>
                                </Link>
                                <Link href={p.href} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    View public page
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= Completed ================= */}
          {activeSection === "completed" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-sky-950">Completed Projects</h2>
                <p className="text-sm text-muted-foreground">
                  NGO-run and government-run projects that finished, with the photos, videos,
                  summary and participant list recorded in the management workspace.
                </p>
              </div>
              {dataLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
                </div>
              ) : completedProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-14 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-200" />
                    <p className="font-medium">No completed projects yet</p>
                    <p className="text-sm text-muted-foreground">
                      When a project is marked completed from its workspace — by the NGO or by the
                      government — it appears here with its evidence.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {completedProjects.map((c) => (
                    <Card key={c.id} className="overflow-hidden border-sky-100">
                      {c.media.some((m) => m.kind === "image") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.media.find((m) => m.kind === "image")!.url}
                          alt={c.title}
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sky-950">{c.title}</h3>
                          <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>
                          {c.source === "government" && (
                            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                              Government project
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{c.organisation}</p>
                        {c.completedSummary && (
                          <p className="mt-2 line-clamp-2 text-sm text-stone-600">{c.completedSummary}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {c.participants.length} participant{c.participants.length === 1 ? "" : "s"}
                          </span>
                          <span>📷 {c.media.length} media</span>
                          <span>{dateLabel(c.completedAt)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full bg-transparent"
                          onClick={() => setDetailCompleted(c)}
                        >
                          View photos & details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= Government Projects ================= */}
          {activeSection === "gov-projects" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-sky-950">Government Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Projects you opened directly. Only community users can see and join these — NGOs
                  never see them. Open Manage to work like an NGO workspace: progress, photos,
                  documents, notices, XP rewards, attendance and completion.
                </p>
              </div>
              {dataLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
                </div>
              ) : govManagedLive.length + govManagedCompleted.length === 0 ? (
                <Card>
                  <CardContent className="py-14 text-center">
                    <Landmark className="mx-auto mb-3 h-10 w-10 text-sky-200" />
                    <p className="font-medium">No government projects yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create one under Create Project — it appears here once published.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {govManagedLive.length > 0 && (
                    <>
                      <h3 className="font-serif text-lg font-semibold text-sky-900">Live</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {govManagedLive.map((p) => (
                          <Card key={p.key} className="border-sky-100">
                            <CardContent className="p-5">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-sky-950">{p.title}</h3>
                                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                                  Live
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <MapPin className="mr-1 inline h-3 w-3" />
                                {p.location}
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1 rounded-full bg-sky-100">
                                  <div
                                    className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                                    style={{ width: `${p.progress}%` }}
                                  />
                                </div>
                                <span className="w-12 text-right text-sm font-semibold text-sky-700">
                                  {p.progress}%
                                </span>
                              </div>
                              <p className="mt-3 text-xs text-muted-foreground">
                                {p.memberCount} participant{p.memberCount === 1 ? "" : "s"} · {p.media?.length || 0} media
                              </p>
                              <div className="mt-3 flex gap-2">
                                <Link href={`/government/project-management/${p.key}`} className="flex-1">
                                  <Button size="sm" className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                                    Manage
                                  </Button>
                                </Link>
                                <Link href={p.href} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    View public page
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                  {govManagedCompleted.length > 0 && (
                    <>
                      <h3 className="font-serif text-lg font-semibold text-sky-900">Completed</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {govManagedCompleted.map((p) => (
                          <Card key={p.key} className="border-sky-100">
                            <CardContent className="p-5">
                              {p.media?.some((m: any) => m.kind === "image") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.media.find((m: any) => m.kind === "image").url}
                                  alt={p.title}
                                  className="mb-3 h-28 w-full rounded-md object-cover"
                                />
                              ) : null}
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-sky-950">{p.title}</h3>
                                <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <MapPin className="mr-1 inline h-3 w-3" />
                                {p.location}
                              </p>
                              {p.completedSummary ? (
                                <p className="mt-2 line-clamp-2 text-sm text-stone-600">{p.completedSummary}</p>
                              ) : null}
                              <p className="mt-2 text-xs text-muted-foreground">
                                {p.memberCount} participant{p.memberCount === 1 ? "" : "s"} · {p.media?.length || 0} media
                              </p>
                              <div className="mt-3 flex gap-2">
                                <Link href={`/government/project-management/${p.key}`} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    View workspace
                                  </Button>
                                </Link>
                                <Link href={p.href} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    View public page
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ================= Create Project ================= */}
          {activeSection === "create-project" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-sky-950">Create Project</h2>
                <p className="text-sm text-muted-foreground">
                  Open a volunteer project directly as the government. Community users see it in
                  their Government Projects section and can join by picking a role. NGOs are not
                  involved and won't see it on their dashboards.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">New government project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Project title</Label>
                      <Input
                        placeholder="e.g. City lake restoration drive"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="What will volunteers do, and what impact will it have?"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="min-h-[90px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={formCategory} onValueChange={setFormCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_CATEGORY_OPTIONS.filter((c) => c.value).map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Address / site</Label>
                      <Input
                        placeholder="e.g. Rabindra Sarobar lake"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Input value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={formState} onChange={(e) => setFormState(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Label>Volunteer roles</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() => setFormRoles((prev) => [...prev, { title: "", slots: "" }])}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add role
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formRoles.map((role, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder={`Role ${idx + 1} title (e.g. Cleanup crew)`}
                            value={role.title}
                            onChange={(e) =>
                              setFormRoles((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, title: e.target.value } : r))
                              )
                            }
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            min={1}
                            placeholder="Slots"
                            value={role.slots}
                            onChange={(e) =>
                              setFormRoles((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, slots: e.target.value } : r))
                              )
                            }
                            className="w-28"
                          />
                          {formRoles.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setFormRoles((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                    disabled={creating}
                    onClick={createProject}
                  >
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Publish project
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* ================= Funding request detail dialog ================= */}
      <Dialog open={detailRequest !== null} onOpenChange={(open) => !open && setDetailRequest(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {detailRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-sky-950">
                  {detailRequest.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge
                    variant="outline"
                    className={
                      detailRequest.status === "funded"
                        ? "bg-sky-100 text-sky-800 border-sky-300"
                        : detailRequest.status === "approved"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                    }
                  >
                    {detailRequest.status === "funded"
                      ? "Approved & payment complete"
                      : detailRequest.status === "approved"
                        ? "Approved — payment pending"
                        : "Awaiting government confirmation"}
                  </Badge>
                  {detailRequest.project?.status === "completed" && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">Project completed</Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="rounded-lg bg-sky-50/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">NGO</p>
                  <p className="mt-1 font-medium text-sky-950">{detailRequest.ngoName}</p>
                  <p className="text-muted-foreground">{detailRequest.ngoEmail}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    commission to NGO: {detailRequest.ngoCommission}
                  </p>
                </div>
                <div className="rounded-lg bg-sky-50/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Funding</p>
                  <p className="mt-1 font-medium text-sky-950">
                    Requested: {detailRequest.projectFunding}
                  </p>
                  {detailRequest.approvedFunding && (
                    <p className="text-sky-900">
                      Approved: <span className="font-semibold">{detailRequest.approvedFunding}</span>
                      {detailRequest.approvedAt && ` · ${dateLabel(detailRequest.approvedAt)}`}
                    </p>
                  )}
                  {detailRequest.fundedAt && (
                    <p className="text-xs text-emerald-700">
                      Payment released {dateLabel(detailRequest.fundedAt)}
                      {detailRequest.paymentRef ? ` · ref ${detailRequest.paymentRef}` : ""}
                    </p>
                  )}
                  {detailRequest.approvedByGov?.name && (
                    <p className="text-xs text-muted-foreground">
                      Reviewed by {detailRequest.approvedByGov.name}
                      {detailRequest.approvedNote ? ` — "${detailRequest.approvedNote}"` : ""}
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-stone-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Project</p>
                  <p className="mt-1">{detailRequest.projectTitle}</p>
                  <p className="text-xs text-muted-foreground">{detailRequest.projectLocation}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Timeline: {detailRequest.timeline}</p>
                  <p className="text-xs text-muted-foreground">Department: {detailRequest.department}</p>
                </div>
                <div className="rounded-lg bg-stone-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Volunteers ({detailRequest.volunteerCount})
                  </p>
                  {detailRequest.volunteers?.length ? (
                    <ul className="mt-1 space-y-1 text-xs">
                      {detailRequest.volunteers.slice(0, 8).map((v, i) => (
                        <li key={i}>
                          {v.name} · {v.roleTitle} · joined {dateLabel(v.joinedAt)}
                        </li>
                      ))}
                      {detailRequest.volunteers.length > 8 && (
                        <li className="text-muted-foreground">
                          +{detailRequest.volunteers.length - 8} more
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">No volunteers recorded.</p>
                  )}
                </div>
                <div className="md:col-span-2 rounded-lg bg-stone-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    NGO's proposal
                  </p>
                  <p className="mt-1 text-stone-700">{detailRequest.proposalSummary}</p>
                  {detailRequest.description && (
                    <p className="mt-2 text-stone-600">{detailRequest.description}</p>
                  )}
                  {detailRequest.implementationPlan && (
                    <p className="mt-2 text-xs text-stone-600">
                      <span className="font-semibold">Implementation:</span>{" "}
                      {detailRequest.implementationPlan}
                    </p>
                  )}
                  {detailRequest.expectedImpact && (
                    <p className="mt-1 text-xs text-stone-600">
                      <span className="font-semibold">Expected impact:</span> {detailRequest.expectedImpact}
                    </p>
                  )}
                  {detailRequest.additionalNotes && (
                    <p className="mt-1 text-xs text-stone-500">Note: {detailRequest.additionalNotes}</p>
                  )}
                </div>

                {(detailRequest.workEvidence.media.length > 0 ||
                  detailRequest.workEvidence.documents.length > 0) && (
                  <div className="md:col-span-2 rounded-lg bg-stone-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Work photos & documentation from the NGO
                    </p>
                    {detailRequest.workEvidence.media.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto">
                        {detailRequest.workEvidence.media.map((m, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={m.url} alt="" className="h-24 w-32 shrink-0 rounded-md object-cover" />
                        ))}
                      </div>
                    )}
                    {detailRequest.workEvidence.documents.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs">
                        {detailRequest.workEvidence.documents.map((d, i) => (
                          <li key={i}>
                            📄{" "}
                            {d.url ? (
                              <a href={d.url} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
                                {d.title}
                              </a>
                            ) : (
                              d.title
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {detailRequest.project && (
                  <div className="md:col-span-2 rounded-lg bg-stone-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Live project progress
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 rounded-full bg-sky-100">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                          style={{ width: `${detailRequest.project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-sky-700">{detailRequest.project.progress}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions by state */}
              {detailRequest.status === "submitted" && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-4">
                  <p className="mb-2 text-sm font-semibold text-sky-900">
                    Confirm this request (payment stays pending)
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      placeholder="Approved funding (e.g. ₹2.4Cr)"
                      value={approvedInputs[detailRequest._id] || ""}
                      onChange={(e) =>
                        setApprovedInputs((prev) => ({ ...prev, [detailRequest._id]: e.target.value }))
                      }
                      className="w-64"
                    />
                    <Input
                      placeholder="Review note (optional)"
                      value={reviewNotes[detailRequest._id] || ""}
                      onChange={(e) =>
                        setReviewNotes((prev) => ({ ...prev, [detailRequest._id]: e.target.value }))
                      }
                      className="min-w-[12rem] flex-1"
                    />
                    <Button
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                      disabled={acting}
                      onClick={() =>
                        act(
                          {
                            action: "approve",
                            id: detailRequest._id,
                            approvedFunding: approvedInputs[detailRequest._id] || detailRequest.projectFunding,
                            note: reviewNotes[detailRequest._id] || "",
                          },
                          detailRequest._id
                        )
                      }
                    >
                      {acting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}
                      Approve & confirm
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Leave the amount empty to approve the requested {detailRequest.projectFunding}.
                  </p>
                </div>
              )}

              {detailRequest.status === "approved" && detailRequest.paymentStatus === "pending" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="mb-2 text-sm font-semibold text-emerald-900">
                    Make the payment to {detailRequest.ngoName}
                  </p>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-emerald-800">
                    <span className="rounded-md bg-white px-2.5 py-1.5 font-semibold">
                      UPI ID: {detailRequest.upiId || "the NGO's registered UPI ID"}
                    </span>
                    <span className="text-emerald-700">
                      Paying {detailRequest.approvedFunding || detailRequest.projectFunding} through
                      the Razorpay gateway — the QR pays into the NGO's UPI ID.
                    </span>
                  </div>
                  <Button
                    className="bg-[#2b84ea] hover:bg-[#1c6fd0] text-white"
                    disabled={acting}
                    onClick={() => {
                      // Close the review dialog behind the gateway so the
                      // checkout is the only dialog on screen.
                      setDetailRequest(null);
                      setPayModalRequest(detailRequest);
                    }}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Pay{" "}
                    {formatRupees(
                      parseRupees(detailRequest.approvedFunding || detailRequest.projectFunding || "₹0")
                    )}{" "}
                    with Razorpay
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Once the payment completes, the project moves to Approved Projects and the NGO is
                    notified of the payment.
                  </p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= Completed project dialog ================= */}
      <Dialog open={detailCompleted !== null} onOpenChange={(open) => !open && setDetailCompleted(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {detailCompleted && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-sky-950">{detailCompleted.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {detailCompleted.organisation} · {detailCompleted.location}
                </p>
              </DialogHeader>
              {detailCompleted.completedSummary && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-stone-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    Completion summary
                  </p>
                  <p className="mt-1">{detailCompleted.completedSummary}</p>
                </div>
              )}
              {detailCompleted.media.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Photos & videos
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {detailCompleted.media.map((m, i) =>
                      m.kind === "video" ? (
                        <video key={i} src={m.url} controls className="h-28 w-full rounded-md object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={m.url} alt="" className="h-28 w-full rounded-md object-cover" />
                      )
                    )}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Participants ({detailCompleted.participants.length})
                </p>
                {detailCompleted.participants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No participants recorded.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {detailCompleted.participants.map((p) => (
                      <span
                        key={p.id}
                        className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-900"
                        title={p.email}
                      >
                        <Users className="mr-1 inline h-3 w-3" />
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {detailCompleted.documents.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Documentation
                  </p>
                  <ul className="space-y-1 text-sm">
                    {detailCompleted.documents.map((d, i) => (
                      <li key={i}>
                        📄{" "}
                        {d.url ? (
                          <a href={d.url} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
                            {d.title}
                          </a>
                        ) : (
                          d.title
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Completed {dateLabel(detailCompleted.completedAt)} · {detailCompleted.attendanceDates.length}{" "}
                attendance session{detailCompleted.attendanceDates.length === 1 ? "" : "s"} recorded
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= Razorpay payment ================= */}
      <RazorpayCheckout
        open={payModalRequest !== null}
        onOpenChange={(open) => !open && setPayModalRequest(null)}
        amountLabel={
          payModalRequest?.approvedFunding || payModalRequest?.projectFunding || "₹0"
        }
        payee={payModalRequest?.ngoName || ""}
        vpa={payModalRequest?.upiId}
        note={payModalRequest?.title}
        onPaid={(paymentId) => {
          const target = payModalRequest;
          if (!target) return;
          // Fire-and-track: act() reloads the dashboard and toasts the result;
          // the success screen stays up until the user closes the checkout.
          act(
            { action: "payment", id: target._id, ref: paymentId },
            target._id
          );
        }}
      />
    </div>
  );
}

// Local helpers ----------------------------------------------------------

function sectionHeaderPrompt(section: string) {
  if (section !== "dashboard") return null;
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-sky-950">Dashboard</h2>
      <p className="text-sm text-muted-foreground">
        NGO funding requests, approved works and everything happening across registered NGOs.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  note: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-sky-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-stone-500">{note}</p>
          </div>
          <div className={`rounded-full bg-sky-50 p-3 ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
