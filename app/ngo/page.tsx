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
  Target,
  TreePine,
  Building,
  HandHeart
} from "lucide-react"
import { useState, useEffect } from "react"
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
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        project: "Versova Beach Transformation",
                        author: "Afroz Shah",
                        role: "Project Leader",
                        feedback:
                          "Our Versova Beach cleanup has removed over 9 million kg of plastic waste and transformed what was once called 'garbage beach'. We now have Olive Ridley turtles nesting here after 20 years!",
                        rating: 5,
                        date: "3 days ago",
                        image: "beach",
                      },
                      {
                        project: "Sundarbans Mangrove Restoration",
                        author: "Priya Mondal",
                        role: "Community Coordinator",
                        feedback:
                          "Our community-led mangrove restoration has planted 50,000+ saplings across 25 hectares. Local fishing families report 30% increase in catch due to improved marine ecosystems.",
                        rating: 5,
                        date: "1 week ago",
                        image: "mangrove",
                      },
                      {
                        project: "Ladakh Artificial Glacier",
                        author: "Sonam Wangchuk",
                        role: "Project Engineer",
                        feedback:
                          "Our ice stupa artificial glaciers have provided 2 million liters of water to 5 villages during crucial spring planting season. Crop yields have increased by 40% this year!",
                        rating: 5,
                        date: "2 weeks ago",
                        image: "glacier",
                      },
                      {
                        project: "Sikkim Organic Farming Transition",
                        author: "Tenzin Lepcha",
                        role: "Regional Coordinator",
                        feedback:
                          "100% organic certification achieved across 12 villages! Farmers report 25% premium on their produce and soil health has dramatically improved with 18% higher nutrient content.",
                        rating: 5,
                        date: "3 weeks ago",
                        image: "farm",
                      },
                    ].map((feedback, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-full h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-4 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        <h4 className="font-medium text-foreground mb-2">{feedback.project}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{feedback.feedback}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{feedback.author}</p>
                            <p className="text-xs text-muted-foreground">{feedback.role}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(feedback.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{feedback.date}</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Heart className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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

                  const formData = new FormData(e.currentTarget);
                  
                  // Get categories and SDG goals
                  const categories = Array.from(formData.getAll('categories'));
                  const sdgGoals = Array.from(formData.getAll('sdgGoals'));
                  
                  const proposalData = {
                    // Basic project info
                    title: formData.get('title'),
                    description: formData.get('description'),
                    location: formData.get('location'),
                    projectFunding: formData.get('projectFunding'),
                    timeline: formData.get('timeline'),

                    // NGO info (server takes identity from the session)
                    ngoId: user?.id || '',
                    ngoName: user?.organizationName || user?.name || user?.email || '',
                    ngoEmail: user?.email || '',
                    ngoCommission: formData.get('ngoCommission'),

                    // Government submission details
                    department: formData.get('department'),
                    proposalSummary: formData.get('proposalSummary'),

                    // Project details
                    expectedImpact: formData.get('expectedImpact'),
                    implementationPlan: formData.get('implementationPlan'),
                    expectedStartDate: formData.get('expectedStartDate'),
                    teamSize: formData.get('teamSize'),
                    experienceLevel: formData.get('experienceLevel'),
                    additionalNotes: formData.get('additionalNotes'),

                    // Categories and goals
                    categories: categories,
                    sdgGoals: sdgGoals,

                    // Key metrics
                    keyMetrics: {
                      volunteers: formData.get('volunteers'),
                      beneficiaries: formData.get('beneficiaries'),
                      areaImpact: formData.get('areaImpact'),
                      carbonReduction: formData.get('carbonReduction')
                    }
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
                  } catch (error) {
                    console.error('Error submitting initiative:', error);
                    toast({
                      title: "❌ Submission Failed",
                      description: "Failed to submit initiative. Please try again.",
                      variant: "destructive",
                      duration: 5000,
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
                        <input type="hidden" name="projectId" value={selectedFundingProject.id} />
                      </>
                    )}
                  </div>

                  {/* Project Categories and Impact */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Project Focus & Impact
                    </h3>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Project Categories</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['Climate Action', 'Clean Water', 'Renewable Energy', 'Waste Management', 'Biodiversity', 'Air Quality'].map((category) => (
                          <label key={category} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" name="categories" value={category} className="rounded border-border" />
                            <span className="text-sm">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">UN SDG Goals</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['SDG 6: Clean Water', 'SDG 7: Clean Energy', 'SDG 11: Sustainable Cities', 'SDG 13: Climate Action', 'SDG 14: Life Below Water', 'SDG 15: Life on Land'].map((sdg) => (
                          <label key={sdg} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" name="sdgGoals" value={sdg} className="rounded border-border" />
                            <span className="text-sm">{sdg}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Expected Impact</label>
                      <Textarea
                        name="expectedImpact"
                        placeholder="Describe the expected environmental and community impact..."
                        className="glass border-border/30 min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Volunteers Needed</label>
                        <Input name="volunteers" placeholder="e.g., 50" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Beneficiaries</label>
                        <Input name="beneficiaries" placeholder="e.g., 1,000" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Area Impact</label>
                        <Input name="areaImpact" placeholder="e.g., 5 km²" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Carbon Reduction</label>
                        <Input name="carbonReduction" placeholder="e.g., 100 tons CO2" className="glass border-border/30" />
                      </div>
                    </div>
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
                        <Select name="department" required>
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
                        <Select name="experienceLevel">
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

          {/* Project Management Section */}
          {activeSection === "project-management" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Ongoing Projects Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">Active Projects</TabsTrigger>
                    <TabsTrigger value="planning">In Planning</TabsTrigger>
                    <TabsTrigger value="completed">Recently Completed</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="mt-6">
                    <div className="space-y-4">
                      {[
                        {
                          name: "River Cleanup Campaign - Yamuna",
                          volunteers: ["Anita Joshi", "Ravi Mehta", "Kavya Reddy", "+18 more"],
                          status: "In Progress",
                          progress: 65,
                          deadline: "Dec 15, 2024",
                          funding: "₹2.8Cr",
                          location: "Delhi-Agra stretch",
                          impactMetrics: {
                            wasteRemoved: "450 tons",
                            waterQualityImprovement: "35%",
                            volunteersEngaged: "420",
                            communitiesReached: "12"
                          },
                          category: "Water Conservation",
                          priorityLevel: "High"
                        },
                        {
                          name: "Urban Tree Planting Initiative",
                          volunteers: ["Deepak Agarwal", "Meera Nair", "Suresh Iyer", "+15 more"],
                          status: "Active",
                          progress: 40,
                          deadline: "Jan 30, 2025",
                          funding: "₹1.5Cr",
                          location: "Mumbai Metropolitan Region",
                          impactMetrics: {
                            treesPlanted: "12,500",
                            co2Offset: "180 tons/year",
                            areasCovered: "8 districts",
                            schoolsInvolved: "45"
                          },
                          category: "Afforestation",
                          priorityLevel: "Medium"
                        },
                        {
                          name: "Plastic-Free Schools Campaign",
                          volunteers: ["Pooja Verma", "Amit Jain", "Ritu Kapoor", "+22 more"],
                          status: "Active",
                          progress: 80,
                          deadline: "Nov 20, 2024",
                          funding: "₹85L",
                          location: "Bangalore Urban",
                          impactMetrics: {
                            schoolsCertified: "185/200",
                            plasticReduced: "2.5 tons/month",
                            studentsEducated: "45,000",
                            teachersTrained: "850"
                          },
                          category: "Waste Management",
                          priorityLevel: "High"
                        },
                        {
                          name: "Solar Energy Adoption - Rural Areas",
                          volunteers: ["Sunita Rao", "Vikram Singh", "Priya Sharma", "+12 more"],
                          status: "In Progress",
                          progress: 55,
                          deadline: "Feb 28, 2025",
                          funding: "₹4.2Cr",
                          location: "Rajasthan Rural Districts",
                          impactMetrics: {
                            homesElectrified: "1,200",
                            energyGenerated: "480 kWh/day",
                            co2Reduced: "350 tons/year",
                            villagesConnected: "18"
                          },
                          category: "Renewable Energy",
                          priorityLevel: "High"
                        },
                        {
                          name: "Coastal Mangrove Restoration",
                          volunteers: ["Arjun Menon", "Lakshmi Nair", "Rajesh Kumar", "+8 more"],
                          status: "Active",
                          progress: 30,
                          deadline: "Jun 15, 2025",
                          funding: "₹3.1Cr",
                          location: "Kerala Coastal Belt",
                          impactMetrics: {
                            areaRestored: "150 hectares",
                            saplingsPlanted: "75,000",
                            fishermenBenefited: "320",
                            biodiversitySpecies: "28 protected"
                          },
                          category: "Marine Conservation",
                          priorityLevel: "Medium"
                        }
                      ].map((project, index) => (
                        <div key={index} className="p-6 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors border border-border/20">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-foreground text-lg">{project.name}</h4>
                                <Badge variant={
                                  project.priorityLevel === "High" ? "destructive" :
                                  project.priorityLevel === "Medium" ? "default" : "secondary"
                                } className={
                                  project.priorityLevel === "High" ? "bg-red-100 text-red-800 hover:bg-red-200" :
                                  project.priorityLevel === "Medium" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" :
                                  "bg-green-100 text-green-800 hover:bg-green-200"
                                }>
                                  {project.priorityLevel} Priority
                                </Badge>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                  {project.category}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {project.location}
                                </span>
                                <span className="font-medium text-green-600">
                                  Funding: {project.funding}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={project.status === "Active" ? "default" : "secondary"} className={
                                project.status === "Active" ? "bg-green-500 hover:bg-green-600 text-white" : ""
                              }>
                                {project.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {project.deadline}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 bg-muted rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-purple-600 min-w-[3rem]">{project.progress}%</span>
                          </div>

                          {/* Impact Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {Object.entries(project.impactMetrics).map(([key, value], metricIndex) => (
                              <div key={metricIndex} className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                                <p className="text-lg font-bold text-purple-600">{value}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Volunteers Section */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex -space-x-2">
                                {project.volunteers.slice(0, 3).map((volunteer, vIndex) => (
                                  <div
                                    key={vIndex}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-2 border-background"
                                  >
                                    <span className="text-xs font-bold text-white">
                                      {volunteer
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                ))}
                                {project.volunteers.length > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                                    <span className="text-xs text-muted-foreground">{project.volunteers[3]}</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {project.volunteers.slice(0, 3).join(", ")}{" "}
                                {project.volunteers.length > 3 && project.volunteers[3]}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="bg-transparent">
                                <FileText className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                                onClick={() => router.push(`/ngo/project-management/${project.name === "River Cleanup Campaign - Yamuna" ? "project123" : `project-${index}`}`)}
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Manage
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="planning" className="mt-6">
                    <div className="space-y-4">
                      {[
                        {
                          name: "Smart Waste Management System",
                          category: "Waste Management",
                          estimatedFunding: "₹3.5Cr",
                          location: "Pune City",
                          estimatedDuration: "18 months",
                          plannedStartDate: "Mar 2025",
                          expectedImpact: "500K residents benefited",
                          planningStage: "Funding Approval",
                          priority: "High",
                          description: "IoT-based smart waste collection and recycling system for urban areas"
                        },
                        {
                          name: "Himalayan Wildlife Corridor",
                          category: "Wildlife Conservation",
                          estimatedFunding: "₹6.8Cr",
                          location: "Uttarakhand Himalayas",
                          estimatedDuration: "42 months",
                          plannedStartDate: "Jun 2025",
                          expectedImpact: "12 endangered species protected",
                          planningStage: "Environmental Clearance",
                          priority: "Medium",
                          description: "Creating wildlife corridors to connect fragmented habitats in the Himalayas"
                        },
                        {
                          name: "Organic Farming Transition Program",
                          category: "Sustainable Agriculture",
                          estimatedFunding: "₹2.2Cr",
                          location: "Punjab Agricultural Belt",
                          estimatedDuration: "24 months",
                          plannedStartDate: "Feb 2025",
                          expectedImpact: "2,500 farmers transitioned",
                          planningStage: "Community Consultation",
                          priority: "Medium",
                          description: "Supporting farmers to transition from chemical to organic farming practices"
                        }
                      ].map((project, index) => (
                        <div key={index} className="p-6 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-foreground text-lg">{project.name}</h4>
                                <Badge variant={
                                  project.priority === "High" ? "destructive" : "default"
                                } className={
                                  project.priority === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                }>
                                  {project.priority} Priority
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                  {project.category}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {project.location}
                                </span>
                                <span className="font-medium text-green-600">
                                  Budget: {project.estimatedFunding}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                              <Clock className="w-3 h-3 mr-1" />
                              {project.planningStage}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-lg font-bold text-purple-600">{project.estimatedDuration}</p>
                              <p className="text-xs text-muted-foreground">Estimated Duration</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-lg font-bold text-blue-600">{project.plannedStartDate}</p>
                              <p className="text-xs text-muted-foreground">Planned Start</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-lg font-bold text-green-600">{project.expectedImpact}</p>
                              <p className="text-xs text-muted-foreground">Expected Impact</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Accelerate Planning
                            </Button>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <FileText className="w-4 h-4 mr-2" />
                              View Proposal
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed" className="mt-6">
                    <div className="space-y-4">
                      {[
                        {
                          name: "Mumbai Plastic Beach Cleanup",
                          category: "Marine Conservation",
                          actualFunding: "₹1.8Cr",
                          location: "Versova Beach, Mumbai",
                          duration: "8 months",
                          completedDate: "Oct 2024",
                          actualImpact: "15K tons plastic removed",
                          successRating: 95,
                          volunteersParticipated: 2500,
                          achievements: [
                            "Removed 15,000 tons of plastic waste",
                            "Restored 2.5km of coastline",
                            "Engaged 2,500 volunteers",
                            "Created 45 permanent jobs"
                          ],
                          awards: ["UN Ocean Conservation Award", "Green India Excellence"]
                        },
                        {
                          name: "Ganga Water Quality Improvement",
                          category: "Water Conservation",
                          actualFunding: "₹4.2Cr",
                          location: "Haridwar to Rishikesh",
                          duration: "18 months",
                          completedDate: "Sep 2024",
                          actualImpact: "Water quality improved by 40%",
                          successRating: 88,
                          volunteersParticipated: 850,
                          achievements: [
                            "Reduced pollution by 40%",
                            "Installed 12 treatment units",
                            "Trained 500 local operators",
                            "Benefited 2M+ people"
                          ],
                          awards: ["National Water Conservation Award"]
                        },
                        {
                          name: "Delhi Air Quality Monitoring",
                          category: "Air Quality",
                          actualFunding: "₹2.5Cr",
                          location: "Delhi NCR",
                          duration: "12 months",
                          completedDate: "Aug 2024",
                          actualImpact: "Real-time monitoring for 20M residents",
                          successRating: 92,
                          volunteersParticipated: 320,
                          achievements: [
                            "Deployed 50 monitoring stations",
                            "Generated 2M+ data points",
                            "Created public awareness app",
                            "Informed policy decisions"
                          ],
                          awards: ["Smart Cities Innovation Award"]
                        }
                      ].map((project, index) => (
                        <div key={index} className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-foreground text-lg">{project.name}</h4>
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                  {project.category}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {project.location}
                                </span>
                                <span className="font-medium text-green-600">
                                  Funding: {project.actualFunding}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {project.volunteersParticipated} volunteers
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-muted-foreground">Success Rate:</span>
                                <span className="text-lg font-bold text-green-600">{project.successRating}%</span>
                              </div>
                              <span className="text-sm text-muted-foreground">Completed: {project.completedDate}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-lg font-bold text-purple-600">{project.duration}</p>
                              <p className="text-xs text-muted-foreground">Project Duration</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-lg font-bold text-blue-600">{project.actualImpact}</p>
                              <p className="text-xs text-muted-foreground">Key Impact</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-lg font-bold text-green-600">{project.awards.length}</p>
                              <p className="text-xs text-muted-foreground">Awards Received</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h5 className="font-medium text-foreground">Key Achievements</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {project.achievements.map((achievement, achIndex) => (
                                <div key={achIndex} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span className="text-muted-foreground">{achievement}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {project.awards.map((award, awardIndex) => (
                                  <Badge key={awardIndex} variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-800">
                                    <Star className="w-3 h-3 mr-1" />
                                    {award}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="bg-transparent">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Final Report
                                </Button>
                                <Button size="sm" variant="outline" className="bg-transparent">
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share Success
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
