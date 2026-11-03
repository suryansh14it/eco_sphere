"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { UserMenu } from "@/components/user-menu"
import {
  Search,
  Bell,
  User,
  Users,
  DollarSign,
  Handshake,
  TrendingUp,
  FileText,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Star,
  MessageSquare,
  Heart,
  Share2,
  CheckCircle,
  Clock,
  Settings,
  Home,
  MapPin,
  TreePine,
  Building,
  HandHeart
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NGODashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Volunteer projects with at least one joined volunteer - only these are
  // eligible to ask the government for funds.
  const [fundingProjects, setFundingProjects] = useState<any[]>([])
  const [selectedFundingProject, setSelectedFundingProject] = useState<any | null>(null)
  const [fundingProjectsLoading, setFundingProjectsLoading] = useState(false)
  // Radix Select values must live in state - their values never land in
  // FormData, so reading `formData.get('department')` silently sends null.
  const [fundingDepartment, setFundingDepartment] = useState("")
  const [fundingExperienceLevel, setFundingExperienceLevel] = useState("")

  // Ongoing Project Management: everything this NGO has undertaken
  // (volunteer projects + adopted public issues), split live / completed.
  const [managedLive, setManagedLive] = useState<any[]>([])
  const [managedCompleted, setManagedCompleted] = useState<any[]>([])
  const [managedLoading, setManagedLoading] = useState(true)

  // Redirect users to their correct dashboard based on role
  useEffect(() => {
    if (!loading && user && user.role !== 'ngo') {
      console.log(`NGO dashboard: Redirecting ${user.role} user to their dashboard`);
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  // Load the NGO's volunteer projects (and their join evidence) whenever the
  // fund-request form opens.
  useEffect(() => {
    if (activeSection !== "local-initiative" || loading || user?.role !== 'ngo') return;
    // Fresh form every time the section opens
    setFundingDepartment("");
    setFundingExperienceLevel("");
    let cancelled = false;
    (async () => {
      setFundingProjectsLoading(true);
      try {
        const res = await fetch('/api/projects?mine=1&limit=100', { credentials: 'include' });
        const data = await res.json();
        if (data.success && !cancelled) {
          const withVolunteers = (data.projects || []).filter((p: any) => p.totalFilled > 0);
          setFundingProjects(withVolunteers);
          setSelectedFundingProject((prev: any) =>
            prev ? (withVolunteers.find((p: any) => p.id === prev.id) || null) : null
          );
        }
      } catch (error) {
        console.error('Error loading volunteer projects for funding:', error);
      } finally {
        if (!cancelled) setFundingProjectsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSection, user, loading]);

  // Undertaken projects (volunteer + adopted issues) for management and the
  // success-stories strip; refreshed when the management section is opened.
  const loadManaged = useCallback(async () => {
    setManagedLoading(true);
    try {
      const res = await fetch('/api/ngo/managed-projects', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setManagedLive(data.live || []);
        setManagedCompleted(data.completed || []);
      }
    } catch (error) {
      console.error('Error loading undertaken projects:', error);
    } finally {
      setManagedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || user?.role !== 'ngo') return;
    loadManaged();
  }, [user, loading, loadManaged]);

  // Show loading only while auth provider is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-purple-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Allow access to dashboard regardless of user state

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-foreground">NGO Hub</span>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns, volunteers, or partners..."
                className="pl-10 glass border-border/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-screen bg-white/80 backdrop-blur-sm border-r border-border/20 p-4">
          <nav className="space-y-2">
            <Button
              variant={activeSection === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "dashboard" ? "bg-purple-500 text-white hover:bg-purple-600" : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Link href="/ngo/issues">
              <Button variant="ghost" className="w-full justify-start hover:bg-purple-50">
                <Users className="w-4 h-4 mr-2" />
                Community Issues
              </Button>
            </Link>
            <Link href="/ngo/projects">
              <Button variant="ghost" className="w-full justify-start hover:bg-purple-50">
                <HandHeart className="w-4 h-4 mr-2" />
                Volunteer Projects
              </Button>
            </Link>
            <Button
              variant={activeSection === "local-initiative" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "local-initiative"
                  ? "bg-purple-500 text-white hover:bg-purple-600"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveSection("local-initiative")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ask Govt for Funds
            </Button>
            <Button
              variant={activeSection === "project-management" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "project-management"
                  ? "bg-purple-500 text-white hover:bg-purple-600"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveSection("project-management")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Ongoing Project Management
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-6 space-y-6">
          {/* Dashboard Section */}
          {activeSection === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Ongoing Projects</p>
                        <p className="text-2xl font-bold text-purple-600">48</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +8 this month
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Volunteers</p>
                        <p className="text-2xl font-bold text-pink-600">1,547</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +126 this week
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-pink-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Funding Raised</p>
                        <p className="text-2xl font-bold text-emerald-600">₹73.9Cr</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +₹28.2Cr this quarter
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Research Partnerships</p>
                        <p className="text-2xl font-bold text-blue-600">18</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +6 new partnerships
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Handshake className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-serif flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Environmental Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">CO₂ Reduced</span>
                      <span className="text-lg font-bold text-green-600">2.4M tons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Trees Planted</span>
                      <span className="text-lg font-bold text-green-600">450K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Water Saved</span>
                      <span className="text-lg font-bold text-blue-600">85M liters</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Waste Diverted</span>
                      <span className="text-lg font-bold text-purple-600">12K tons</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-serif flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Financial Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Research Projects</span>
                      <span className="text-lg font-bold text-teal-600">₹45.2Cr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Community Initiatives</span>
                      <span className="text-lg font-bold text-purple-600">₹28.7Cr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Commission Earned</span>
                      <span className="text-lg font-bold text-green-600">₹1.8Cr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Available Funds</span>
                      <span className="text-lg font-bold text-blue-600">₹12.3Cr</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-serif flex items-center gap-2">
                      <Users className="w-5 h-5 text-pink-600" />
                      Community Reach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">People Impacted</span>
                      <span className="text-lg font-bold text-pink-600">2.8M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Communities Served</span>
                      <span className="text-lg font-bold text-purple-600">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Educational Programs</span>
                      <span className="text-lg font-bold text-blue-600">1,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Awareness Events</span>
                      <span className="text-lg font-bold text-orange-600">89</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Community Feedback & Success Stories */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Community Feedback & Success Stories
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Projects you have completed — highlighted on your dashboard once you mark them done
                    in Ongoing Project Management.
                  </p>
                </CardHeader>
                <CardContent>
                  {managedLoading ? (
                    <p className="text-sm text-muted-foreground py-4">Loading completed projects...</p>
                  ) : managedCompleted.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No completed projects yet. Mark a project completed in Ongoing Project Management and it will appear here.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {managedCompleted.slice(0, 6).map((project) => {
                        const cover = project.media?.find((m: any) => m.kind === 'image');
                        return (
                          <Link key={project.key} href={`/ngo/project-management/${project.key}`} className="group">
                            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors h-full">
                              <div className="w-full h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                {cover ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={cover.url} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                  <CheckCircle className="w-8 h-8 text-green-600" />
                                )}
                              </div>

                              <h4 className="font-medium text-foreground mb-2 group-hover:underline">{project.title}</h4>
                              {project.completedSummary ? (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{project.completedSummary}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                              )}

                              <div className="flex flex-wrap items-center justify-between text-xs text-stone-500">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {project.memberCount} participant{project.memberCount === 1 ? "" : "s"}
                                </span>
                                <span>
                                  Completed{" "}
                                  {project.completedAt
                                    ? new Date(project.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                    : "recently"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Local Initiative Section */}
          {activeSection === "local-initiative" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Ask the Government for Funds
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Pick one of your volunteer projects that people have already joined and submit a
                  funding request to the government. The volunteers who joined are shown to the
                  government as proof of community support.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitSuccess(false);

                  if (!selectedFundingProject) {
                    toast({
                      title: "Pick a volunteer project first",
                      description: "Funding can only be requested for a volunteer project that people have already joined.",
                      variant: "destructive",
                      duration: 5000,
                    });
                    setIsSubmitting(false);
                    return;
                  }

                  if (!fundingDepartment) {
                    toast({
                      title: "Select a government department",
                      description: "Choose which department this funding request should go to.",
                      variant: "destructive",
                      duration: 5000,
                    });
                    setIsSubmitting(false);
                    return;
                  }

                  const formData = new FormData(e.currentTarget);

                  const proposalData = {
                    // Project identity comes from React state, NOT FormData:
                    // the hidden-input/none-selected timing has bitten us
                    // before, and the project picked in the picker is the
                    // single source of truth for what we're asking funds for.
                    projectId: selectedFundingProject.id,
                    title: selectedFundingProject.title,
                    description: selectedFundingProject.description,
                    location: [
                      selectedFundingProject.location?.address,
                      selectedFundingProject.location?.district,
                      selectedFundingProject.location?.state,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not specified",
                    projectFunding: formData.get('projectFunding'),
                    timeline: formData.get('timeline'),

                    // NGO info (server takes identity from the session)
                    ngoId: user?.id || '',
                    ngoName: user?.organizationName || user?.name || user?.email || '',
                    ngoEmail: user?.email || '',
                    ngoCommission: formData.get('ngoCommission'),

                    // Government submission details (department is a Radix
                    // Select - read from controlled state, not FormData)
                    department: fundingDepartment,
                    proposalSummary: formData.get('proposalSummary'),

                    // Project details
                    implementationPlan: formData.get('implementationPlan'),
                    expectedStartDate: formData.get('expectedStartDate'),
                    teamSize: formData.get('teamSize'),
                    experienceLevel: fundingExperienceLevel,
                    additionalNotes: formData.get('additionalNotes'),
                  };

                  try {
                    const response = await fetch('/api/ngo/local-initiative', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(proposalData),
                    });

                    const result = await response.json();
                    console.log('📋 API Response:', result);

                    if (result.success) {
                      setSubmitSuccess(true);
                      
                      // Reset form and show success message after 3 seconds
                      setTimeout(() => {
                        (e.currentTarget as HTMLFormElement).reset();
                        setFundingDepartment("");
                        setFundingExperienceLevel("");
                        setSubmitSuccess(false);
                        toast({
                          title: "🎉 Funding Request Submitted!",
                          description: `Your request for "${proposalData.title}" has been sent to the government with ${selectedFundingProject.totalFilled} joined volunteer(s) as evidence.`,
                          duration: 6000,
                        });
                      }, 3000);
                    } else {
                      throw new Error(result.message || 'Failed to submit initiative');
                    }
                  } catch (error: any) {
                    console.error('Error submitting initiative:', error);
                    toast({
                      title: "❌ Submission Failed",
                      description: error?.message || "Failed to submit the funding request. Please try again.",
                      variant: "destructive",
                      duration: 6000,
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}>
                  
                  {/* Step 1 - pick the volunteer project evidence */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Project On The Volunteer Board
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      You can only ask the government for funds for a volunteer project people have
                      already joined - the volunteers who signed up are shown to the government as
                      proof of community support.
                    </p>

                    {fundingProjectsLoading ? (
                      <p className="text-sm text-muted-foreground py-2">Loading your projects...</p>
                    ) : fundingProjects.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-orange-300 bg-orange-50 p-4 text-sm text-orange-800">
                        <p className="font-medium mb-1">No volunteer project has community sign-ups yet</p>
                        <p>
                          Create a project under Volunteer Projects, and once volunteers join it will
                          become eligible for government funding requests.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Select your volunteer project <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={selectedFundingProject?.id || ""}
                          onChange={(e) => {
                            setSelectedFundingProject(
                              fundingProjects.find((p) => p.id === e.target.value) || null
                            );
                          }}
                          required
                        >
                          <option value="">Choose a project with joined volunteers</option>
                          {fundingProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.title} ({project.totalFilled} volunteer
                              {project.totalFilled === 1 ? "" : "s"} joined)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedFundingProject && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-sm font-semibold text-emerald-800">
                          {selectedFundingProject.totalFilled} volunteer
                          {selectedFundingProject.totalFilled === 1 ? "" : "s"} have already joined
                          this project
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">
                          Names shown to the government:{" "}
                          {(selectedFundingProject.members || [])
                            .map((m: any) => m.name)
                            .join(", ")}
                        </p>
                        <div className="mt-2 space-y-2">
                          {(selectedFundingProject.members || []).map((m: any) => (
                            <div
                              key={m.id}
                              className="rounded-md border border-emerald-100 bg-white px-2.5 py-2 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-stone-800">{m.name}</span>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                  {m.roleTitle}
                                </span>
                              </div>
                              <p className="mt-0.5 text-stone-600">
                                Joined this project as {m.roleTitle} · {m.email}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedFundingProject && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Project Title</label>
                          <Input
                            name="title"
                            readOnly
                            key={`title-${selectedFundingProject.id}`}
                            defaultValue={selectedFundingProject.title}
                            className="glass border-border/30 bg-muted/30"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Project Description</label>
                          <Textarea
                            name="description"
                            readOnly
                            key={`desc-${selectedFundingProject.id}`}
                            defaultValue={selectedFundingProject.description}
                            className="glass border-border/30 min-h-[100px] bg-muted/30"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Project Location</label>
                            <Input
                              name="location"
                              readOnly
                              key={`loc-${selectedFundingProject.id}`}
                              defaultValue={
                                [
                                  selectedFundingProject.location?.address,
                                  selectedFundingProject.location?.district,
                                  selectedFundingProject.location?.state,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "Not specified"
                              }
                              className="glass border-border/30 bg-muted/30"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Timeline <span className="text-red-500">*</span>
                            </label>
                            <Input name="timeline" placeholder="e.g., 18 months" className="glass border-border/30" required />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Requested Funding <span className="text-red-500">*</span>
                          </label>
                          <Input name="projectFunding" placeholder="e.g., ₹40L" className="glass border-border/30" required />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Government Submission Details */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-700 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Government Proposal Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Government Department <span className="text-red-500">*</span>
                        </label>
                        <Select name="department" required value={fundingDepartment} onValueChange={setFundingDepartment}>
                          <SelectTrigger className="glass border-border/30">
                            <SelectValue placeholder="Select government department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="environmental">Environmental Protection</SelectItem>
                            <SelectItem value="urban">Urban Planning & Development</SelectItem>
                            <SelectItem value="energy">Energy & Resources</SelectItem>
                            <SelectItem value="health">Public Health</SelectItem>
                            <SelectItem value="agriculture">Agriculture & Rural Development</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="transport">Transport & Infrastructure</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          NGO Commission Percentage <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="ngoCommission"
                          type="number"
                          placeholder="Enter percentage (e.g., 8)"
                          className="glass border-border/30"
                          min="0"
                          max="20"
                          step="0.1"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">Maximum 20% commission allowed</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Government Proposal Summary <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        name="proposalSummary"
                        placeholder="Summarize why this initiative should receive government funding, expected outcomes, and public benefit..."
                        className="glass border-border/30 min-h-[100px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Implementation Plan</label>
                      <Textarea
                        name="implementationPlan"
                        placeholder="Describe how you plan to implement this initiative and allocate funds..."
                        className="glass border-border/30 min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Expected Start Date</label>
                        <Input name="expectedStartDate" type="date" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Team Size</label>
                        <Input name="teamSize" type="number" placeholder="Number of team members" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
                        <Select name="experienceLevel" value={fundingExperienceLevel} onValueChange={setFundingExperienceLevel}>
                          <SelectTrigger className="glass border-border/30">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                            <SelectItem value="experienced">Experienced (5-10 years)</SelectItem>
                            <SelectItem value="expert">Expert (10+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Additional Notes</label>
                      <Textarea
                        name="additionalNotes"
                        placeholder="Any additional information, concerns, or special requirements..."
                        className="glass border-border/30 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className={`w-full py-3 transition-all duration-300 ${
                      submitSuccess 
                        ? 'bg-green-600 hover:bg-green-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    disabled={isSubmitting || submitSuccess}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Funding Request...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Funding Request Submitted Successfully!
                      </>
                    ) : (
                      <>
                        <TreePine className="w-4 h-4 mr-2" />
                        Ask the Government for Funds
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Ongoing Project Management Section */}
          {activeSection === "project-management" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Ongoing Project Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Projects you have undertaken — the volunteer projects you posted and the public
                  issues you adopted. Track progress, share media and notices, run attendance, and
                  complete projects.
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="live" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="live">Live Projects ({managedLive.length})</TabsTrigger>
                    <TabsTrigger value="completed">Recently Completed ({managedCompleted.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="live" className="mt-6">
                    <div className="space-y-4">
                      {managedLoading ? (
                        <p className="text-sm text-muted-foreground py-6">Loading your projects...</p>
                      ) : managedLive.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                          <p>No live projects yet</p>
                          <p className="text-sm">
                            Post a volunteer project or adopt a public issue, and it will show up here.
                          </p>
                        </div>
                      ) : (
                        managedLive.map((project) => (
                          <div key={project.key} className="p-6 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors border border-border/20">
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <h4 className="font-medium text-foreground text-lg">{project.title}</h4>
                                  <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                                    {project.kind === 'volunteer' ? 'Volunteer project' : 'Adopted public issue'}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {project.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    {project.memberCount} participant{project.memberCount === 1 ? "" : "s"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5" />
                                    {project.notices?.length || 0} notice{(project.notices?.length || 0) === 1 ? "" : "s"} · {project.media?.length || 0} media
                                  </span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                                onClick={() => router.push(`/ngo/project-management/${project.key}`)}
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Manage
                              </Button>
                            </div>

                            {/* Progress bar */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-muted rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-purple-600 min-w-[3rem]">{project.progress}%</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed" className="mt-6">
                    <div className="space-y-4">
                      {managedLoading ? (
                        <p className="text-sm text-muted-foreground py-6">Loading completed projects...</p>
                      ) : managedCompleted.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                          <p>Nothing completed yet</p>
                          <p className="text-sm">Mark a live project completed from its manage page.</p>
                        </div>
                      ) : (
                        managedCompleted.map((project) => {
                          const cover = project.media?.find((m: any) => m.kind === 'image');
                          return (
                            <div key={project.key} className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <h4 className="font-medium text-foreground text-lg">{project.title}</h4>
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Completed
                                    </Badge>
                                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                                      {project.kind === 'volunteer' ? 'Volunteer project' : 'Adopted public issue'}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5" />
                                      {project.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5" />
                                      {project.memberCount} participants
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      Completed {project.completedAt ? new Date(project.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                  onClick={() => router.push(`/ngo/project-management/${project.key}`)}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Photos, Videos & Participants
                                </Button>
                              </div>

                              {cover ? (
                                <div className="flex gap-3 overflow-x-auto">
                                  {project.media.slice(0, 4).map((m: any, i: number) => (
                                    <div key={i} className="w-40 h-28 rounded-lg overflow-hidden bg-white shrink-0">
                                      {m.kind === 'image' ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <video src={m.url} className="w-full h-full object-cover" muted />
                                      )}
                                    </div>
                                  ))}
                                  {(project.media?.length || 0) === 0 && (
                                    <p className="text-sm text-muted-foreground">No media was added to this project.</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {project.completedSummary || "No media was added to this project."}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}</main>
      </div>
    </div>
  )
}
