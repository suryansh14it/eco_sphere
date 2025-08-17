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
} from "lucide-react"
import { useState, useEffect } from "react"

export default function NGODashboard() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState("dashboard")
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'ngo') {
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show loading
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-purple-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If wrong role, redirect
  if (user.role !== 'ngo') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-purple-700">Redirecting to appropriate dashboard...</p>
        </div>
      </div>
    );
  }

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
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
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
            <Button
              variant={activeSection === "researcher-projects" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "researcher-projects"
                  ? "bg-purple-500 text-white hover:bg-purple-600"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveSection("researcher-projects")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Researcher Advised Projects
            </Button>
            <Button
              variant={activeSection === "government-proposal" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "government-proposal"
                  ? "bg-purple-500 text-white hover:bg-purple-600"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveSection("government-proposal")}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Government Proposal
            </Button>
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
              Create Local Initiative
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
                        <p className="text-2xl font-bold text-purple-600">23</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +3 this month
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
                        <p className="text-2xl font-bold text-pink-600">342</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +28 this week
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
                        <p className="text-sm text-muted-foreground">Funding Raised</p>
                        <p className="text-2xl font-bold text-emerald-600">₹15.2Cr</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +15% this quarter
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
                        <p className="text-sm text-muted-foreground">Partnerships</p>
                        <p className="text-2xl font-bold text-blue-600">18</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +2 new partners
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Handshake className="w-6 h-6 text-blue-600" />
                      </div>
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
                        project: "Beach Cleanup Success",
                        author: "Sunita Rao",
                        role: "Volunteer Coordinator",
                        feedback:
                          "Amazing turnout! We collected over 500kg of waste and educated 200+ beachgoers about marine conservation.",
                        rating: 5,
                        date: "2 days ago",
                        image: "beach",
                      },
                      {
                        project: "Solar Panel Installation",
                        author: "Kiran Desai",
                        role: "Community Leader",
                        feedback:
                          "The solar installation project exceeded expectations. We're now generating 40% of our community center's energy needs.",
                        rating: 5,
                        date: "1 week ago",
                        image: "solar",
                      },
                      {
                        project: "Urban Garden Initiative",
                        author: "Lakshmi Pillai",
                        role: "Local Resident",
                        feedback:
                          "The community garden has brought neighbors together and provides fresh produce for 50+ families. Truly transformative!",
                        rating: 4,
                        date: "2 weeks ago",
                        image: "garden",
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

          {/* Researcher-Advised Projects Section */}
          {activeSection === "researcher-projects" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Researcher-Advised Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Urban Air Quality Monitoring Network",
                      researcher: "Dr. Priya Sharma - Environmental Science Institute",
                      status: "Active",
                      funding: "₹3.8Cr",
                      volunteers: 45,
                      description:
                        "Comprehensive air quality monitoring system across 15 urban locations with real-time data collection and community engagement.",
                      timeline: "18 months",
                      impact: "Monitoring 2.5M residents",
                    },
                    {
                      title: "Coastal Erosion Prevention Initiative",
                      researcher: "Prof. Rajesh Menon - Marine Research Center",
                      status: "Planning",
                      funding: "₹2.7Cr",
                      volunteers: 28,
                      description:
                        "Community-based coastal protection using natural barriers and sustainable engineering solutions.",
                      timeline: "24 months",
                      impact: "Protecting 12km coastline",
                    },
                    {
                      title: "Biodiversity Conservation Program",
                      researcher: "Dr. Anjali Krishnan - Wildlife Conservation Lab",
                      status: "Active",
                      funding: "₹5.7Cr",
                      volunteers: 67,
                      description:
                        "Multi-species conservation effort focusing on habitat restoration and community education.",
                      timeline: "36 months",
                      impact: "Protecting 15 species",
                    },
                  ].map((project, index) => (
                    <div key={index} className="border border-border/20 rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{project.title}</h4>
                          <p className="text-sm text-teal-600 mb-2">{project.researcher}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                            <span>Funding: {project.funding}</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {project.volunteers} volunteers
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                        >
                          {expandedProject === index ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {expandedProject === index && (
                        <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-foreground">Timeline: </span>
                              <span className="text-muted-foreground">{project.timeline}</span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Expected Impact: </span>
                              <span className="text-muted-foreground">{project.impact}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                              Join Project
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Contact Researcher
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Government Proposal Section */}
          {activeSection === "government-proposal" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  Submit Government Proposal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Proposal Title</label>
                    <Input placeholder="Enter proposal title..." className="glass border-border/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Department</label>
                    <Select>
                      <SelectTrigger className="glass border-border/30">
                        <SelectValue placeholder="Select government department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">Environmental Protection</SelectItem>
                        <SelectItem value="urban">Urban Planning</SelectItem>
                        <SelectItem value="energy">Energy & Resources</SelectItem>
                        <SelectItem value="health">Public Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Funding Request</label>
                    <Input placeholder="₹0" className="glass border-border/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Proposal Summary</label>
                    <Textarea
                      placeholder="Describe your proposal, expected outcomes, and community impact..."
                      className="glass border-border/30 min-h-[100px]"
                    />
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Submit to Government</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Local Initiative Section */}
          {activeSection === "local-initiative" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Create Local Initiative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Initiative Name</label>
                    <Input placeholder="Enter initiative name..." className="glass border-border/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                    <Select>
                      <SelectTrigger className="glass border-border/30">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cleanup">Community Cleanup</SelectItem>
                        <SelectItem value="education">Environmental Education</SelectItem>
                        <SelectItem value="conservation">Conservation Project</SelectItem>
                        <SelectItem value="awareness">Awareness Campaign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Target Volunteers</label>
                    <Input placeholder="Number of volunteers needed" className="glass border-border/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                    <Textarea
                      placeholder="Describe the initiative, goals, and how volunteers can help..."
                      className="glass border-border/30 min-h-[100px]"
                    />
                  </div>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">Launch Initiative</Button>
                </div>
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
                          name: "River Cleanup Campaign",
                          volunteers: ["Anita Joshi", "Ravi Mehta", "Kavya Reddy", "+12 more"],
                          status: "In Progress",
                          progress: 65,
                          deadline: "Dec 15, 2024",
                        },
                        {
                          name: "Urban Tree Planting",
                          volunteers: ["Deepak Agarwal", "Meera Nair", "Suresh Iyer", "+8 more"],
                          status: "Active",
                          progress: 40,
                          deadline: "Jan 30, 2025",
                        },
                        {
                          name: "Plastic-Free Schools",
                          volunteers: ["Pooja Verma", "Amit Jain", "Ritu Kapoor", "+15 more"],
                          status: "Active",
                          progress: 80,
                          deadline: "Nov 20, 2024",
                        },
                      ].map((project, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-foreground">{project.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">{project.status}</Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {project.deadline}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
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

                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="planning" className="mt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4" />
                      <p>Projects in planning phase will appear here</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="completed" className="mt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                      <p>Recently completed projects will appear here</p>
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
