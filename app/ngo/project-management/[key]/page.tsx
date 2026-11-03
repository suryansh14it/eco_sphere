"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Save,
  Send,
  Trash2,
  UserMinus,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface ManagedMember {
  userId: string;
  name: string;
  email: string;
  roleTitle: string;
  joinedAt: string | Date | null;
}

interface ManagedItem {
  key: string;
  kind: "volunteer" | "issue";
  refId: string;
  title: string;
  description: string;
  location: string;
  href: string;
  progress: number;
  completedAt: string | Date | null;
  completedSummary: string;
  media: { kind: string; url: string; name?: string; uploadedAt: string | Date }[];
  documents: { title: string; url?: string; uploadedAt: string | Date }[];
  notices: { title: string; body: string; createdAt: string | Date }[];
  members: ManagedMember[];
  memberCount: number;
}

interface AttendanceRow {
  date: string;
  records: { userId: string; name: string; present: boolean; xpAwarded: boolean }[];
}

const dateLabel = (d: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function ProjectWorkspacePage() {
  const params = useParams<{ key: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const key = String(params?.key || "");

  const [item, setItem] = useState<ManagedItem | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // progress
  const [progress, setProgress] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);
  // media
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaVideo, setMediaVideo] = useState(false);
  // documents
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  // notices
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  // completion
  const [completeSummary, setCompleteSummary] = useState("");
  // xP award input per member id
  const [xpInputs, setXpInputs] = useState<Record<string, string>>({});
  // attendance
  const [attDate, setAttDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attMarks, setAttMarks] = useState<Record<string, boolean>>({});
  const [savingAtt, setSavingAtt] = useState(false);

  const load = useCallback(async () => {
    setLoadingData(true);
    setError("");
    try {
      const res = await fetch(`/api/ngo/managed-projects?detail=1&key=${encodeURIComponent(key)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setItem(data.item);
        setAttendance(data.attendance || []);
        setProgress(data.item.progress || 0);
        const today = new Date().toISOString().slice(0, 10);
        const existing = (data.attendance || []).find((a: any) => a.date === today);
        const marks: Record<string, boolean> = {};
        for (const m of data.item.members || []) {
          const rec = existing?.records?.find((r: any) => r.userId === m.userId);
          marks[m.userId] = rec ? Boolean(rec.present) : false;
        }
        setAttMarks(marks);
        if (data.item.completedAt) setCompleteSummary(data.item.completedSummary || "");
      } else {
        setError(data.message || "Could not load this project.");
      }
    } catch (e) {
      console.error(e);
      setError("Could not load this project.");
    } finally {
      setLoadingData(false);
    }
  }, [key]);

  useEffect(() => {
    if (!loading && user?.role === "ngo" && key) load();
    if (!loading && user && user.role !== "ngo") router.push(`/${user.role}`);
  }, [user, loading, key, load, router]);

  const completed = Boolean(item?.completedAt);

  const act = async (payload: Record<string, unknown>, okMessage?: string) => {
    const res = await fetch("/api/ngo/managed-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ key, ...payload }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(okMessage || data.message || "Saved.");
      await load();
      return true;
    }
    toast.error(data.message || "Action failed.");
    return false;
  };

  /** Convert a picked image file to a data URL (kept small for MongoDB). */
  const pickImage = (file: File | null) =>
    new Promise<string>((resolve, reject) => {
      if (!file) return resolve("");
      if (file.size > 3 * 1024 * 1024) return reject(new Error("Image must be under 3 MB."));
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read the file."));
      reader.readAsDataURL(file);
    });

  const membersWithXp = useMemo(() => item?.members || [], [item]);

  const header = (
    <div className="border-b border-purple-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/ngo">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            NGO dashboard
          </Button>
        </Link>
        <span className="text-sm font-medium text-purple-900">Ongoing Project Management</span>
      </div>
    </div>
  );

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
        {header}
        <main className="mx-auto flex max-w-6xl items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </main>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
        {header}
        <main className="mx-auto max-w-3xl py-24">
          <Card className="border-red-200">
            <CardContent className="p-6 text-sm text-red-700">{error || "Project not found."}</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      {header}
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* ---------- Project overview ---------- */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl font-semibold text-purple-950">{item.title}</h1>
                  <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                    {item.kind === "volunteer" ? "Volunteer project" : "Adopted public issue"}
                  </Badge>
                  {completed ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed {dateLabel(item.completedAt)}
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">Live</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {item.memberCount} participant{item.memberCount === 1 ? "" : "s"}
                  </span>
                  <Link href={item.href} className="text-purple-600 hover:underline">
                    View public page →
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Progress slider ---------- */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Project Progress</CardTitle>
            {!completed && (
              <p className="text-sm text-muted-foreground">Slide to the level the project has reached.</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={5}
                disabled={completed}
                onValueChange={(v) => setProgress(v[0])}
                className="flex-1"
              />
              <span className="w-14 text-right text-lg font-semibold text-purple-600">{progress}%</span>
            </div>
            {!completed && (
              <Button
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white"
                disabled={savingProgress}
                onClick={async () => {
                  setSavingProgress(true);
                  await act({ action: "progress", progress });
                  setSavingProgress(false);
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save progress
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ---------- Photos / Videos ---------- */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Photos & Videos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload on-site photos (added straight from a file) or link a video. Participants see
              these on the public project page.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!completed && (
              <div className="flex flex-wrap items-end gap-3 rounded-lg border border-purple-100 bg-purple-50/50 p-3">
                <label className="cursor-pointer text-sm">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-2 text-xs font-medium text-purple-700 border border-purple-200">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload photo (max 3 MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      try {
                        const dataUrl = await pickImage(e.target.files?.[0] || null);
                        if (dataUrl) {
                          const ok = await act(
                            { action: "addMedia", kind: "image", url: dataUrl, name: e.target.files?.[0]?.name || "photo" },
                            "Photo added."
                          );
                          if (!ok) return;
                        }
                      } catch (err: any) {
                        toast.error(err.message || "Could not add photo.");
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => setMediaVideo((v) => !v)}
                >
                  <Video className="w-3.5 h-3.5 mr-1" />
                  {mediaVideo ? "Linking a video" : "Add a video link"}
                </Button>
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    placeholder={mediaVideo ? "https://youtube.com/..." : "https://..."}
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={async () => {
                      if (!mediaUrl.trim()) return toast.error("Paste a link first.");
                      const ok = await act(
                        { action: "addMedia", kind: mediaVideo ? "video" : "image", url: mediaUrl.trim() },
                        "Media added."
                      );
                      if (ok) setMediaUrl("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {(item.media?.length || 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No photos or videos yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {item.media.map((m, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg border border-emerald-100 bg-white">
                    {m.kind === "video" ? (
                      <video src={m.url} controls className="h-28 w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt={m.name || "project media"} className="h-28 w-full object-cover" />
                    )}
                    {!completed && (
                      <button
                        className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-red-600 opacity-0 transition group-hover:opacity-100"
                        title="Remove"
                        onClick={() => act({ action: "removeMedia", url: m.url }, "Media removed.")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------- Documentation & Notices ---------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!completed && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Document title (e.g., Site survey report)"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="min-w-[10rem] flex-1"
                  />
                  <Input
                    placeholder="Link (optional)"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="min-w-[8rem] flex-1"
                  />
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={async () => {
                      if (!docTitle.trim()) return toast.error("Give the document a title.");
                      const ok = await act(
                        { action: "addDocument", title: docTitle.trim(), url: docUrl.trim() },
                        "Documentation added."
                      );
                      if (ok) {
                        setDocTitle("");
                        setDocUrl("");
                      }
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {(item.documents?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No documents added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {item.documents.map((doc, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 text-purple-900">
                        <FileText className="w-3.5 h-3.5" />
                        {doc.url ? (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="hover:underline">
                            {doc.title}
                          </a>
                        ) : (
                          doc.title
                        )}
                        {doc.url && <LinkIcon className="w-3 h-3 text-purple-400" />}
                      </span>
                      {!completed && (
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => act({ action: "removeDocument", title: doc.title }, "Document removed.")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600" />
                Notices to participants
              </CardTitle>
              <p className="text-sm text-muted-foreground">Shared with everyone taking part.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {!completed && (
                <div className="space-y-2">
                  <Input
                    placeholder="Notice title"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Message to all participating community members..."
                    value={noticeBody}
                    onChange={(e) => setNoticeBody(e.target.value)}
                    className="min-h-[64px]"
                  />
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={async () => {
                      if (!noticeTitle.trim() || !noticeBody.trim())
                        return toast.error("Notices need both a title and a message.");
                      const ok = await act(
                        { action: "addNotice", title: noticeTitle.trim(), body: noticeBody.trim() },
                        "Notice shared with all participants."
                      );
                      if (ok) {
                        setNoticeTitle("");
                        setNoticeBody("");
                      }
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publish notice
                  </Button>
                </div>
              )}
              {(item.notices?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No notices published yet.</p>
              ) : (
                <ul className="space-y-2">
                  {item.notices.map((n, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-purple-900">{n.title}</p>
                        {!completed && (
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => act({ action: "removeNotice", title: n.title, createdAt: n.createdAt }, "Notice removed.")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 text-stone-600">{n.body}</p>
                      <p className="mt-1 text-xs text-stone-400">{dateLabel(n.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---------- Community members ---------- */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Community members ({item.memberCount})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Award XP for participation, or remove a member from the project. Present days marked
              in attendance earn {10} XP automatically.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {membersWithXp.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No community members yet — volunteers join from the public project page.
              </p>
            ) : (
              membersWithXp.map((m) => (
                <div
                  key={m.userId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-purple-100 bg-white px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-semibold text-stone-800">{m.name}</p>
                    <p className="text-xs text-stone-500">
                      {m.email || "No email on record"} · {m.roleTitle} ·{" "}
                      {m.joinedAt ? `joined ${dateLabel(m.joinedAt)}` : "early participant"}
                    </p>
                  </div>
                  {!completed && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Input
                          className="h-8 w-24"
                          type="number"
                          min={1}
                          max={500}
                          placeholder="XP"
                          value={xpInputs[m.userId] || ""}
                          onChange={(e) => setXpInputs((prev) => ({ ...prev, [m.userId]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                          onClick={async () => {
                            const amount = Number(xpInputs[m.userId]);
                            if (!amount || amount < 1) return toast.error("Enter XP amount (1-500).");
                            const ok = await act(
                              { action: "awardXp", userId: m.userId, amount, name: m.name },
                              `Awarded ${amount} XP to ${m.name}.`
                            );
                            if (ok) setXpInputs((prev) => ({ ...prev, [m.userId]: "" }));
                          }}
                        >
                          <Award className="w-3.5 h-3.5 mr-1" />
                          Award
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        onClick={() => act({ action: "removeMember", userId: m.userId }, `${m.name} removed from the project.`)}
                      >
                        <UserMinus className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* ---------- Attendance centre ---------- */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-600" />
              Attendance centre
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mark each member present or absent for a date. Present members get 10 XP.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!completed && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Label className="text-sm">Date</Label>
                  <Input
                    type="date"
                    className="w-44"
                    value={attDate}
                    onChange={(e) => {
                      const d = e.target.value;
                      setAttDate(d);
                      const existing = attendance.find((a) => a.date === d);
                      const marks: Record<string, boolean> = {};
                      for (const m of item.members) {
                        const rec = existing?.records?.find((r) => r.userId === m.userId);
                        marks[m.userId] = rec ? Boolean(rec.present) : false;
                      }
                      setAttMarks(marks);
                    }}
                  />
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    disabled={savingAtt || item.members.length === 0}
                    onClick={async () => {
                      setSavingAtt(true);
                      await act(
                        {
                          action: "attendance",
                          date: attDate,
                          records: item.members.map((m) => ({
                            userId: m.userId,
                            name: m.name,
                            present: Boolean(attMarks[m.userId]),
                          })),
                        },
                        "Attendance saved."
                      );
                      setSavingAtt(false);
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save attendance
                  </Button>
                </div>

                {item.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No members to mark yet.</p>
                ) : (
                  <div className="space-y-2">
                    {item.members.map((m) => (
                      <div
                        key={m.userId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-stone-700">{m.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            className={`rounded-full px-3 py-1 text-xs font-medium border ${
                              attMarks[m.userId]
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-white text-stone-500 border-stone-200"
                            }`}
                            onClick={() => setAttMarks((prev) => ({ ...prev, [m.userId]: true }))}
                          >
                            Present
                          </button>
                          <button
                            className={`rounded-full px-3 py-1 text-xs font-medium border ${
                              attMarks[m.userId] === false
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-white text-stone-500 border-stone-200"
                            }`}
                            onClick={() => setAttMarks((prev) => ({ ...prev, [m.userId]: false }))}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Saved attendance
              </p>
              {attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance marked yet.</p>
              ) : (
                <div className="space-y-2">
                  {attendance.map((a) => (
                    <div
                      key={a.date}
                      className="rounded-lg border border-stone-100 bg-stone-50/60 px-3 py-2 text-xs text-stone-600"
                    >
                      <span className="font-semibold text-stone-800">{dateLabel(a.date)}</span>
                      {" · "}
                      {a.records.filter((r) => r.present).length} present / {a.records.length} marked
                      {" · "}
                      {a.records.filter((r) => r.present).map((r) => r.name).join(", ") || "none present"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---------- Complete / completion summary ---------- */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              {completed ? "Completion summary" : "Mark the project completed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!completed ? (
              <>
                <Textarea
                  placeholder="Summarise what was achieved (shown with photos and participants in the success stories)..."
                  value={completeSummary}
                  onChange={(e) => setCompleteSummary(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={async () => {
                    const ok = await act({ action: "complete", summary: completeSummary.trim() }, "Project marked as completed.");
                    if (ok) router.push("/ngo");
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Project Completed
                </Button>
              </>
            ) : (
              <div>
                {item.completedSummary ? (
                  <p className="text-sm text-stone-700">{item.completedSummary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No completion summary was added.</p>
                )}
                <p className="mt-2 text-xs text-stone-400">
                  Completed {dateLabel(item.completedAt)} · {item.media.length} media items attached
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
