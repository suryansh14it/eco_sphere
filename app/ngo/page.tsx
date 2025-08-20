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
  Building
} from "lucide-react"
import { useState, useEffect } from "react"
import { NGOProjectProposalModal } from "@/components/ngo-project-proposal-modal"
import { useToast } from "@/hooks/use-toast"

export default function NGODashboard() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'ngo') {
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  // Project data for the researcher-advised projects
  const researcherAdvisedProjects = [
    {
      title: "Delhi-NCR Air Quality Monitoring Network",
      researcher: "Dr. Priya Sharma - IIT Delhi Environmental Science Department",
      researcherEmail: "priya.sharma@iitd.ac.in",
      researcherPhone: "+91-9812345678",
      status: "Active",
      funding: "₹4.8Cr",
      researcherCommission: "₹19.2L",
      commissionPercent: 4.0,
      volunteers: 85,
      description:
        "Real-time air quality monitoring across 35 Delhi-NCR locations, with pollution source identification and community-driven mitigation. Supported by CPCB and Delhi Govt.",
      timeline: "24 months",
      impact: "Monitoring 18.6M residents",
      startDate: "Jan 2024",
      endDate: "Dec 2025",
      progress: 65,
      milestones: [
        { name: "Sensor Installation", status: "Completed", date: "Mar 2024" },
        { name: "Data Collection Framework", status: "Completed", date: "Jun 2024" },
        { name: "Community Training", status: "In Progress", date: "Aug 2024" },
        { name: "Report Generation", status: "Pending", date: "Dec 2025" }
      ],
      categories: ["Air Quality", "Urban Environment", "Public Health"],
      location: "Delhi, NCR",
      sdgGoals: ["SDG 3: Good Health", "SDG 11: Sustainable Cities"],
      keyMetrics: {
        pollutionReduction: "15%",
        stationsInstalled: "35/35",
        dataPoints: "2.5M+",
        communityReach: "18.6M"
      }
    },
    {
      title: "Odisha Coastal Erosion Prevention",
      researcher: "Prof. Rajesh Menon - National Institute of Ocean Technology",
      researcherEmail: "rajesh.menon@niot.res.in",
      researcherPhone: "+91-9432123456",
      status: "Planning",
      funding: "₹5.4Cr",
      researcherCommission: "₹21.6L",
      commissionPercent: 4.0,
      volunteers: 42,
      description:
        "Mangrove restoration and eco-engineered seawalls to protect Odisha coastal villages from erosion. Supported by Odisha Govt and NIOT.",
      timeline: "36 months",
      impact: "Protecting 32km coastline",
      startDate: "Feb 2025",
      endDate: "Feb 2028",
      progress: 15,
      milestones: [
        { name: "Site Assessment", status: "Completed", date: "Feb 2025" },
        { name: "Community Consultation", status: "In Progress", date: "Mar 2025" },
        { name: "Mangrove Planting", status: "Pending", date: "Jun 2025" },
        { name: "Seawall Construction", status: "Pending", date: "Oct 2025" }
      ],
      categories: ["Coastal Protection", "Marine Conservation", "Climate Adaptation"],
      location: "Puri, Odisha",
      sdgGoals: ["SDG 13: Climate Action", "SDG 14: Life Below Water"],
      keyMetrics: {
        coastlineProtected: "32km",
        mangrovesPlanted: "50,000 planned",
        villagesProtected: "12",
        familiesBenefited: "2,800"
      }
    },
    {
      title: "Western Ghats Biodiversity Conservation",
      researcher: "Dr. Anjali Krishnan - Wildlife Institute of India",
      researcherEmail: "anjali.krishnan@wii.gov.in",
      researcherPhone: "+91-9123456789",
      status: "Active",
      funding: "₹7.2Cr",
      researcherCommission: "₹28.8L",
      commissionPercent: 4.0,
      volunteers: 127,
      description:
        "Conservation of 24 endemic and endangered species in Western Ghats via habitat corridor restoration and anti-poaching. Supported by Kerala Forest Dept and WII.",
      timeline: "48 months",
      impact: "Protecting 35 species",
      startDate: "Mar 2023",
      endDate: "Mar 2027",
      progress: 45,
      milestones: [
        { name: "Species Survey", status: "Completed", date: "Aug 2023" },
        { name: "Habitat Mapping", status: "Completed", date: "Dec 2023" },
        { name: "Conservation Actions", status: "In Progress", date: "Ongoing" },
        { name: "Monitoring Setup", status: "In Progress", date: "Sep 2024" }
      ],
      categories: ["Biodiversity", "Wildlife Conservation", "Habitat Restoration"],
      location: "Western Ghats, Kerala",
      sdgGoals: ["SDG 15: Life on Land", "SDG 6: Clean Water"],
      keyMetrics: {
        speciesProtected: "24/35",
        habitatRestored: "1,200 hectares",
        corridorsCreated: "8",
        localGuardsHired: "45"
      }
    },
    {
      title: "Himalayan Glacial Lake Monitoring",
      researcher: "Dr. Vikram Singh - Wadia Institute of Himalayan Geology",
      researcherEmail: "vikram.singh@wihg.res.in",
      researcherPhone: "+91-9876543210",
      status: "Active",
      funding: "₹6.7Cr",
      researcherCommission: "₹26.8L",
      commissionPercent: 4.0,
      volunteers: 52,
      description:
        "Remote sensing and monitoring of 18 glacial lakes in Uttarakhand for GLOF early warning. Supported by Uttarakhand Govt and WIHG.",
      timeline: "36 months",
      impact: "Protecting 32 downstream villages",
      startDate: "Jul 2023",
      endDate: "Jul 2026",
      progress: 55,
      milestones: [
        { name: "Lake Identification", status: "Completed", date: "Sep 2023" },
        { name: "Sensor Deployment", status: "Completed", date: "Mar 2024" },
        { name: "Warning System Development", status: "In Progress", date: "Dec 2024" },
        { name: "Community Training", status: "Pending", date: "Apr 2025" }
      ],
      categories: ["Climate Monitoring", "Disaster Prevention", "Glaciology"],
      location: "Uttarakhand Himalayas",
      sdgGoals: ["SDG 13: Climate Action", "SDG 1: No Poverty"],
      keyMetrics: {
        lakesMonitored: "18/18",
        sensorsInstalled: "54",
        villagesProtected: "32",
        earlyWarningsIssued: "12"
      }
    },
    {
      title: "Ganges River Pollution Remediation",
      researcher: "Prof. Meenakshi Chatterjee - National Environmental Engineering Research Institute",
      researcherEmail: "meenakshi.chatterjee@neeri.res.in",
      researcherPhone: "+91-9598765432",
      status: "Planning",
      funding: "₹8.5Cr",
      researcherCommission: "₹34L",
      commissionPercent: 4.0,
      volunteers: 215,
      description:
        "Comprehensive pollution mapping, bioremediation deployment, and wastewater treatment technology implementation across critical stretches of the Ganges river.",
      timeline: "60 months",
      impact: "Improving water for 70M people",
      startDate: "Apr 2025",
      endDate: "Apr 2030",
      progress: 8,
      milestones: [
        { name: "Pollution Assessment", status: "In Progress", date: "Jun 2025" },
        { name: "Technology Selection", status: "Pending", date: "Sep 2025" },
        { name: "Pilot Implementation", status: "Pending", date: "Jan 2026" },
        { name: "Full Scale Deployment", status: "Pending", date: "Jul 2026" }
      ],
      categories: ["Water Quality", "River Restoration", "Bioremediation"],
      location: "Varanasi to Allahabad",
      sdgGoals: ["SDG 6: Clean Water", "SDG 14: Life Below Water"],
      keyMetrics: {
        riverStretch: "300km",
        treatmentPlants: "15 planned",
        peopleBenefited: "70M",
        pollutionReduction: "60% target"
      }
    },
    {
      title: "Mumbai Mangrove Ecosystem Restoration",
      researcher: "Dr. Kavita Patel - Bombay Natural History Society",
      researcherEmail: "kavita.patel@bnhs.org",
      researcherPhone: "+91-92XXXXXX34",
      status: "Active",
      funding: "₹3.2Cr",
      researcherCommission: "₹12.8L",
      commissionPercent: 4.0,
      volunteers: 78,
      description:
        "Restoration and protection of Mumbai's critical mangrove ecosystems through community engagement, waste management, and biodiversity enhancement programs.",
      timeline: "30 months",
      impact: "Restoring 850 hectares",
      startDate: "May 2024",
      endDate: "Nov 2026",
      progress: 35,
      milestones: [
        { name: "Baseline Survey", status: "Completed", date: "Jul 2024" },
        { name: "Community Mobilization", status: "In Progress", date: "Sep 2024" },
        { name: "Restoration Activities", status: "In Progress", date: "Ongoing" },
        { name: "Monitoring Setup", status: "Pending", date: "Jan 2025" }
      ],
      categories: ["Mangrove Restoration", "Urban Ecology", "Coastal Protection"],
      location: "Mumbai, Maharashtra",
      sdgGoals: ["SDG 14: Life Below Water", "SDG 11: Sustainable Cities"],
      keyMetrics: {
        areaRestored: "320/850 hectares",
        treesPlanted: "25,000",
        wasteRemoved: "180 tons",
        speciesRecovered: "12"
      }
    }
  ];

  const handleJoinProject = (projectIndex: number) => {
    setSelectedProject(researcherAdvisedProjects[projectIndex]);
    setIsProposalModalOpen(true);
  };

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

          {/* Researcher-Advised Projects Section */}
          {activeSection === "researcher-projects" && (
            <div className="space-y-6">
              {/* Quick Stats for Researcher Projects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Research Projects</p>
                        <p className="text-2xl font-bold text-teal-600">12</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +3 this month
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Research Funding</p>
                        <p className="text-2xl font-bold text-blue-600">₹45.2Cr</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +₹8.5Cr this quarter
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Researcher Commission Earned</p>
                        <p className="text-2xl font-bold text-green-600">₹1.8Cr</p>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Average 4.2% commission
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Handshake className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Researcher-Advised Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {researcherAdvisedProjects.map((project, index) => (
                      <div key={index} className="border border-border/20 rounded-lg p-6 bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-2 text-lg">{project.title}</h4>
                            <p className="text-sm text-teal-600 mb-3 font-medium">{project.researcher}</p>
                            
                            {/* Status and Key Info */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <Badge variant={project.status === "Active" ? "default" : "secondary"} className={
                                project.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""
                              }>
                                {project.status}
                              </Badge>
                              <span className="font-medium">Funding: {project.funding}</span>
                              <span className="flex items-center gap-1 font-medium text-green-600">
                                <DollarSign className="w-3 h-3" />
                                Researcher Commission: {project.researcherCommission} ({project.commissionPercent}%)
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {project.volunteers} volunteers
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-sm font-medium text-foreground">Progress:</span>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-purple-600">{project.progress}%</span>
                            </div>

                            {/* Categories and SDG Goals */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.categories.map((category, catIndex) => (
                                <Badge key={catIndex} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                  {category}
                                </Badge>
                              ))}
                              {project.sdgGoals.map((goal, sdgIndex) => (
                                <Badge key={sdgIndex} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                  {goal}
                                </Badge>
                              ))}
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
                          <div className="mt-4 pt-4 border-t border-border/20 space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                            
                            {/* Detailed Project Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Project Timeline */}
                              <div className="space-y-3">
                                <h5 className="font-medium text-foreground">Project Timeline</h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Start Date:</span>
                                    <span className="font-medium">{project.startDate}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">End Date:</span>
                                    <span className="font-medium">{project.endDate}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="font-medium">{project.timeline}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="font-medium">{project.location}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Financial Details */}
                              <div className="space-y-3">
                                <h5 className="font-medium text-foreground">Financial Details</h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Funding:</span>
                                    <span className="font-medium text-blue-600">{project.funding}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Researcher Commission:</span>
                                    <span className="font-medium text-green-600">{project.researcherCommission}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Commission Rate:</span>
                                    <span className="font-medium text-green-600">{project.commissionPercent}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Available for NGO:</span>
                                    <span className="font-medium">₹{(parseFloat(project.funding.replace('₹', '').replace('Cr', '')) - parseFloat(project.researcherCommission.replace('₹', '').replace('L', '')) / 10).toFixed(1)}Cr+</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-foreground">Key Metrics & Impact</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(project.keyMetrics).map(([key, value], metricIndex) => (
                                  <div key={metricIndex} className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                                    <p className="text-lg font-bold text-purple-600">{value}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Milestones */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-foreground">Project Milestones</h5>
                              <div className="space-y-2">
                                {project.milestones.map((milestone, milestoneIndex) => (
                                  <div key={milestoneIndex} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                    <div className={`w-3 h-3 rounded-full ${
                                      milestone.status === 'Completed' ? 'bg-green-500' :
                                      milestone.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-300'
                                    }`}></div>
                                    <div className="flex-1">
                                      <span className="text-sm font-medium">{milestone.name}</span>
                                      <span className="text-xs text-muted-foreground ml-2">({milestone.date})</span>
                                    </div>
                                    <Badge variant={
                                      milestone.status === 'Completed' ? 'default' :
                                      milestone.status === 'In Progress' ? 'secondary' : 'outline'
                                    } className={
                                      milestone.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                      milestone.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                      'bg-gray-100 text-gray-600 border-gray-200'
                                    }>
                                      {milestone.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Researcher Contact & Actions */}
                            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-border/20">
                              <div className="flex-1 space-y-2">
                                <h5 className="font-medium text-foreground">Researcher Contact</h5>
                                <div className="text-sm space-y-1">
                                  <p className="text-muted-foreground">Email: {project.researcherEmail}</p>
                                  <p className="text-muted-foreground">Phone: {project.researcherPhone}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-purple-500 hover:bg-purple-600 text-white"
                                  onClick={() => handleJoinProject(index)}
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Join Project
                                </Button>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Contact Researcher
                                </Button>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Reports
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Local Initiative Section */}
          {activeSection === "local-initiative" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Create Local Environmental Initiative
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Start your own community-driven environmental project and submit it directly to the government for funding approval.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitSuccess(false);
                  
                  const formData = new FormData(e.currentTarget);
                  
                  // Get categories and SDG goals
                  const categories = Array.from(formData.getAll('categories'));
                  const sdgGoals = Array.from(formData.getAll('sdgGoals'));
                  
                  const proposalData = {
                    proposalType: 'local-initiative',
                    title: formData.get('title'),
                    description: formData.get('description'),
                    projectFunding: formData.get('projectFunding'),
                    location: formData.get('location'),
                    timeline: formData.get('timeline'),
                    categories: categories,
                    sdgGoals: sdgGoals,
                    expectedImpact: formData.get('expectedImpact'),
                    keyMetrics: {
                      volunteers: formData.get('volunteers'),
                      beneficiaries: formData.get('beneficiaries'),
                      areaImpact: formData.get('areaImpact'),
                      carbonReduction: formData.get('carbonReduction')
                    },
                    researcher: null, // No researcher for local initiatives
                    ngoId: user?.id,
                    ngoName: user?.name || user?.email,
                    ngoEmail: user?.email,
                    ngoCommission: formData.get('ngoCommission'),
                    targetDepartment: formData.get('department'),
                    proposalSummary: formData.get('proposalSummary'),
                    implementationPlan: formData.get('implementationPlan'),
                    expectedStartDate: formData.get('expectedStartDate'),
                    teamSize: formData.get('teamSize'),
                    experienceLevel: formData.get('experienceLevel'),
                    additionalNotes: formData.get('additionalNotes')
                  };

                  try {
                    const response = await fetch('/api/government-proposals', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(proposalData),
                    });

                    const result = await response.json();
                    
                    if (response.ok) {
                      setSubmitSuccess(true);
                      
                      // Reset form and show success message after 3 seconds
                      setTimeout(() => {
                        e.currentTarget.reset();
                        setSubmitSuccess(false);
                        toast({
                          title: "🎉 Initiative Submitted Successfully!",
                          description: `Local Initiative "${proposalData.title}" has been submitted to the government for review and funding approval.`,
                          duration: 6000,
                        });
                      }, 3000);
                    } else {
                      throw new Error(result.error || 'Failed to submit initiative');
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
                  
                  {/* Project Basic Information */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Project Information
                    </h3>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Project Title <span className="text-red-500">*</span>
                      </label>
                      <Input name="title" placeholder="Enter your project title" className="glass border-border/30" required />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Project Description <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        name="description"
                        placeholder="Describe your environmental initiative in detail..."
                        className="glass border-border/30 min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Project Location <span className="text-red-500">*</span>
                        </label>
                        <Input name="location" placeholder="e.g., Downtown Vancouver, BC" className="glass border-border/30" required />
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
                      <Input name="projectFunding" placeholder="e.g., $50,000 or ₹40L" className="glass border-border/30" required />
                    </div>
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
                        Submitting Initiative...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Initiative Submitted Successfully!
                      </>
                    ) : (
                      <>
                        <TreePine className="w-4 h-4 mr-2" />
                        Submit Local Initiative to Government
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

      {/* NGO Project Proposal Modal */}
      {selectedProject && (
        <NGOProjectProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => {
            setIsProposalModalOpen(false);
            setSelectedProject(null);
          }}
          projectData={selectedProject}
          userEmail={user?.email || ''}
          userName={user?.name || user?.email || ''}
          userId={user?.id || ''}
        />
      )}
    </div>
  )
}
