"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from "@/components/protected-route"
import { UserMenu } from "@/components/user-menu"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AIAnalysisModal } from "@/components/ai-analysis-modal"
import { GovRequestDetailsModal, type GovNewRequestDetail } from "@/components/government/request-details-modal"
import { GovOngoingDetailsModal, type GovOngoingDetail } from "@/components/government/ongoing-details-modal"
import { GovCompletedDetailsModal, type GovCompletedDetail } from "@/components/government/completed-details-modal"
import {
  Search,
  Bell,
  User,
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  BarChart3,
  DollarSign,
  Leaf,
  TrendingUp,
  Filter,
  MoreHorizontal,
  MapPin,
  Calendar,
  Brain,
} from "lucide-react"

const useCountUp = (end: number, duration = 1000, delay = 0) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        setCount(Math.floor(progress * end))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [end, duration, delay])

  return count
}

export default function GovernmentDashboard() {
  const [activeTab, setActiveTab] = useState("co2")
  const [fundingFilter, setFundingFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<GovNewRequestDetail | null>(null)
  const [ongoingModalOpen, setOngoingModalOpen] = useState(false)
  const [selectedOngoing, setSelectedOngoing] = useState<GovOngoingDetail | null>(null)
  const [completedModalOpen, setCompletedModalOpen] = useState(false)
  const [selectedCompleted, setSelectedCompleted] = useState<GovCompletedDetail | null>(null)

  const activeProjectsCount = useCountUp(142, 800, 100)
  const pendingRequestsCount = useCountUp(37, 600, 200)
  const fundingCount = useCountUp(5.7, 1000, 300)
  const co2Count = useCountUp(2850, 1200, 400)

  const carbonReductionCount = useCountUp(2850, 1000, 0)
  const speciesCount = useCountUp(47, 800, 0)
  const oceanAreaCount = useCountUp(780, 1000, 0)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("[v0] Searching for:", query)
  }

  const handleFilterChange = (filter: string) => {
    setFundingFilter(filter)
    console.log("[v0] Filter changed to:", filter)
  }

  const handleProjectAction = (projectId: string, action: string) => {
    console.log("[v0] Project action:", action, "for project:", projectId)
  }

  // Enhanced project data with descriptions for AI analysis
  const projectRequests: GovNewRequestDetail[] = [
    {
      id: "req-urban-forest",
      title: "Urban Forest Restoration",
      organization: "Green Cities NGO",
      location: "Mumbai, MH",
      priority: "High",
      description: "Comprehensive urban forest restoration project aimed at planting 10,000 native trees across Mumbai's residential and commercial areas. The project focuses on improving air quality, reducing urban heat island effect, and creating green corridors for wildlife. Includes community engagement programs and long-term maintenance plans.",
      requestedFunding: "₹1.5Cr",
      objectives: ["Plant 10,000 native trees in 12 wards", "Establish 5 community nurseries", "Develop maintenance MoUs with RWAs"],
      proposedTimeline: { start: "Oct 2025", end: "Sep 2026" },
      proposedImpact: { summary: "Reduce urban heat islands and sequester carbon.", co2ReductionTons: 1200, treesPlanted: 10000, areaRestoredHa: 24 },
      requirements: ["Municipal permissions", "Water access at sites", "Nursery setup space"],
      coordinator: { name: "Anita Sharma", contact: "+91-98XXXXXX12" },
      attachments: [{ name: "Project Proposal.pdf" }]
    },
    {
      id: "req-marine-cleanup",
      title: "Marine Cleanup Initiative",
      organization: "Ocean Guardians",
      location: "Chennai, TN",
      priority: "Medium",
      description: "Large-scale marine cleanup initiative targeting plastic pollution in Chennai's coastal waters. The project includes advanced filtration systems, community beach cleanups, and educational programs for local fishing communities. Expected to clean 50 square kilometers of ocean area and remove 500 tons of plastic waste.",
      requestedFunding: "₹80L",
      objectives: ["Deploy 10 floating booms", "Conduct 24 community cleanups", "Set up recycling partnerships"],
      proposedTimeline: { start: "Sep 2025", end: "Mar 2026" },
      proposedImpact: { summary: "Reduce marine plastic and improve coastal health.", areaRestoredHa: 5, speciesProtected: 12 },
      requirements: ["Port permissions", "Waste processing tie-up"],
      coordinator: { name: "R. Prakash", contact: "+91-97XXXXXX45" }
    },
    {
      id: "req-solar-pune",
      title: "Solar Panel Installation",
      organization: "Renewable Future",
      location: "Pune, MH",
      priority: "High",
      description: "Installation of solar panels across 200 government buildings and schools in Pune district. The project aims to generate 5MW of clean energy, reduce carbon emissions by 3,000 tons annually, and provide energy independence for public institutions. Includes training programs for local technicians.",
      requestedFunding: "₹2.7Cr",
      objectives: ["Install 5MW capacity", "Train 60 local technicians"],
      proposedTimeline: { start: "Aug 2025", end: "Aug 2026" },
      proposedImpact: { summary: "Clean energy generation and emissions reduction.", co2ReductionTons: 3000 },
      requirements: ["Building access", "DISCOM approvals"]
    },
    {
      id: "req-himalayan-glacier",
      title: "Himalayan Glacier Monitoring",
      organization: "Himalayan Ecosystem Studies",
      location: "Shimla, HP",
      priority: "High",
      description: "Implementation of advanced remote sensing technology to monitor glacial retreat in the Himalayan region. The project will track 15 major glaciers, analyze meltwater patterns, and develop early warning systems for glacial lake outburst floods (GLOFs). Includes training of local communities and creation of disaster response protocols.",
      requestedFunding: "₹3.8Cr",
      objectives: ["Deploy 15 sensors", "Create GLOF early warning"],
      proposedTimeline: { start: "Oct 2025", end: "Dec 2026" },
      proposedImpact: { summary: "Disaster risk reduction and research." },
      requirements: ["Permits in protected zones", "Satellite data access"],
      coordinator: { name: "Dr. L. Negi", contact: "+91-96XXXXXX32" }
    },
    {
      id: "req-sustainable-fishery",
      title: "Sustainable Fishery Development",
      organization: "Coastal Communities Alliance",
      location: "Kochi, KL",
      priority: "Medium",
      description: "Comprehensive program to transform traditional fishing practices into sustainable operations along Kerala's coast. Includes deployment of selective fishing gear, establishment of no-fishing zones, training on sustainable harvesting methods, and direct market linkages to ensure fair prices for fisher communities.",
      requestedFunding: "₹1.2Cr",
      objectives: ["Establish 3 no-fishing zones", "Train 500 fishers"],
      proposedTimeline: { start: "Sep 2025", end: "Sep 2026" },
      proposedImpact: { summary: "Sustainable fisheries and biodiversity protection.", speciesProtected: 8 },
      requirements: ["Regulatory approvals", "Community consent"]
    },
    {
      id: "req-rural-microgrids",
      title: "Rural Solar Microgrids",
      organization: "Energy Access India",
      location: "Ranchi, JH",
      priority: "High",
      description: "Development of solar microgrids in 75 off-grid villages in Jharkhand, providing renewable electricity to approximately 15,000 residents. The project includes installation of 3MW decentralized solar capacity, battery storage systems, mini-distribution networks, and training of local technicians for maintenance and operations.",
      requestedFunding: "₹4.5Cr",
      objectives: ["Install 3MW microgrids", "Electrify 75 villages"],
      proposedTimeline: { start: "Aug 2025", end: "Dec 2026" },
      proposedImpact: { summary: "Energy access and social upliftment." },
      requirements: ["Land use permissions", "Battery supply contracts"]
    },
    {
      id: "req-western-ghats",
      title: "Western Ghats Biodiversity Conservation",
      organization: "Forest Guardians Network",
      location: "Coimbatore, TN",
      priority: "Medium",
      description: "Integrated conservation initiative in the Western Ghats focusing on protecting endemic species and their habitats. The project combines scientific research, anti-poaching patrols, habitat restoration, and community-based conservation. Targets protection of 25 endangered species through collaborative efforts with local tribal communities.",
      requestedFunding: "₹2.2Cr",
      objectives: ["Anti-poaching patrols", "Habitat restoration"],
      proposedTimeline: { start: "Sep 2025", end: "Sep 2027" },
      proposedImpact: { summary: "Habitat protection and species conservation.", speciesProtected: 25 },
      requirements: ["Forest dept coordination"]
    }
  ]

  const handleSidebarClick = (section: string) => {
    setActiveSection(section)
    console.log("[v0] Sidebar section changed to:", section)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold text-primary">{activeProjectsCount}</p>
                      <p className="text-xs text-emerald-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <LayoutDashboard className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Requests</p>
                      <p className="text-2xl font-bold text-orange-600">{pendingRequestsCount}</p>
                      <p className="text-xs text-orange-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Requires attention
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Funding</p>
                      <p className="text-2xl font-bold text-emerald-600">₹{(fundingCount * 83).toFixed(1)}Cr</p>
                      <p className="text-xs text-emerald-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8% allocated
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
                      <p className="text-sm text-muted-foreground">CO₂ Reduction</p>
                      <p className="text-2xl font-bold text-green-600">{co2Count.toLocaleString()}t</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <Leaf className="w-3 h-3 mr-1" />
                        This quarter
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-serif">New Project Requests</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => console.log("[v0] Filter clicked")}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectRequests.map((request, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedRequest(request)
                          setRequestModalOpen(true)
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{request.title}</h4>
                          <p className="text-sm text-muted-foreground">{request.organization}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {request.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {request.requestedFunding}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={request.priority === "High" ? "destructive" : "secondary"}>
                            {request.priority}
                          </Badge>
                          <AIAnalysisModal projectData={{
                            title: request.title,
                            organization: request.organization,
                            funding: request.requestedFunding,
                            location: request.location,
                            priority: request.priority,
                            description: request.description,
                          }}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <Brain className="w-4 h-4" />
                              AI Analyse
                            </Button>
                          </AIAnalysisModal>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRequest(request)
                              setRequestModalOpen(true)
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProjectAction(request.title, "more-options")
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Impact Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="co2">CO₂</TabsTrigger>
                      <TabsTrigger value="biodiversity">Biodiversity</TabsTrigger>
                      <TabsTrigger value="marine">Marine</TabsTrigger>
                    </TabsList>
                    <TabsContent value="co2" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Carbon Reduction</span>
                          <span className="font-medium">{carbonReductionCount.toLocaleString()} tons</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">75% of quarterly target achieved</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="biodiversity" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Species Protected</span>
                          <span className="font-medium">{speciesCount} species</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">60% of annual target achieved</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="marine" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Ocean Area Cleaned</span>
                          <span className="font-medium">{oceanAreaCount} km²</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">85% of quarterly target achieved</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </>
        )

      case "new-requests":
        return (
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-serif">New Project Requests</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                onClick={() => console.log("[v0] Filter clicked")}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectRequests.map((request, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(request)
                      setRequestModalOpen(true)
                    }}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{request.title}</h4>
                      <p className="text-sm text-muted-foreground">{request.organization}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {request.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {request.requestedFunding}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={request.priority === "High" ? "destructive" : "secondary"}>
                        {request.priority}
                      </Badge>
                      <AIAnalysisModal projectData={{
                        title: request.title,
                        organization: request.organization,
                        funding: request.requestedFunding,
                        location: request.location,
                        priority: request.priority,
                        description: request.description,
                      }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <Brain className="w-4 h-4" />
                          AI Analyse
                        </Button>
                      </AIAnalysisModal>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setRequestModalOpen(true)
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProjectAction(request.title, "more-options")
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "ongoing-projects":
        return (
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-serif">Ongoing Projects</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={fundingFilter === "all" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                  onClick={() => handleFilterChange("all")}
                >
                  All Funding
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={fundingFilter === "high" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                  onClick={() => handleFilterChange("high")}
                >
                  High Priority
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={fundingFilter === "low" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                  onClick={() => handleFilterChange("low")}
                >
                  Low Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[ 
                  {
                    title: "National Solar Mission Phase III",
                    progress: 72,
                    funding: "₹24.5Cr",
                    deadline: "Mar 2025",
                    status: "On Track",
                  },
                  {
                    title: "Yamuna Floodplain Restoration",
                    progress: 45,
                    funding: "₹12.8Cr",
                    deadline: "Jul 2025",
                    status: "Delayed",
                  },
                  {
                    title: "National Clean Air Programme - Delhi Phase",
                    progress: 88,
                    funding: "₹18.6Cr",
                    deadline: "Dec 2024",
                    status: "Ahead",
                  },
                  {
                    title: "Namami Gange - Varanasi Segment",
                    progress: 65,
                    funding: "₹32.7Cr",
                    deadline: "Apr 2025",
                    status: "On Track",
                  },
                  {
                    title: "Sustainable Himalayan Ecosystem Initiative",
                    progress: 51,
                    funding: "₹27.5Cr",
                    deadline: "Sep 2025",
                    status: "On Track",
                  },
                  {
                    title: "Kutch Mangrove Restoration Project",
                    progress: 92,
                    funding: "₹8.4Cr",
                    deadline: "Nov 2024",
                    status: "Ahead",
                  },
                  {
                    title: "Tamil Nadu Coastal Zone Protection",
                    progress: 37,
                    funding: "₹16.2Cr",
                    deadline: "Aug 2025",
                    status: "Delayed",
                  }
                ].map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      const detail: GovOngoingDetail = {
                        id: `ongoing-${index}`,
                        title: project.title,
                        funding: project.funding,
                        status: project.status as GovOngoingDetail["status"],
                        progress: project.progress,
                        deadline: project.deadline,
                        workstreams: [
                          { name: "Procurement", progress: Math.min(100, project.progress + 5) },
                          { name: "Implementation", progress: project.progress },
                          { name: "Community Outreach", progress: Math.max(0, project.progress - 10) },
                        ],
                        issues: project.status === "Delayed" ? [
                          { date: "Aug 2025", title: "Monsoon delays", severity: "medium", notes: "Site access constraints" }
                        ] : [],
                        team: [ { role: "PM", name: "Project Office" }, { role: "Field Lead", name: "Ops Team" } ]
                      }
                      setSelectedOngoing(detail)
                      setOngoingModalOpen(true)
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{project.title}</h4>
                        <Badge
                          variant={
                            project.status === "On Track"
                              ? "default"
                              : project.status === "Delayed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-2">
                        <span>Funding: {project.funding}</span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {project.deadline}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "completed":
        return (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Recently Completed Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[ 
                  {
                    title: "Rewa Ultra Mega Solar Project",
                    impact: "1.8 million tons CO₂ saved annually",
                    funding: "₹45.5Cr",
                    completion: "Jul 2025",
                  },
                  {
                    title: "Ganga River Pollution Monitoring Network",
                    impact: "125km waterway monitored with real-time data",
                    funding: "₹28.7Cr",
                    completion: "May 2025",
                  },
                  {
                    title: "Delhi Green Belt Expansion",
                    impact: "1.2 million trees planted across NCR",
                    funding: "₹14.2Cr",
                    completion: "Jun 2025",
                  },
                  {
                    title: "Kaziranga Wildlife Corridor Protection",
                    impact: "4 endangered species habitats connected",
                    funding: "₹22.6Cr",
                    completion: "Apr 2025",
                  },
                  {
                    title: "Kochi Sustainable Fisheries Management",
                    impact: "35% increase in fish stocks, 1200 fishermen benefited",
                    funding: "₹9.8Cr",
                    completion: "Mar 2025",
                  },
                  {
                    title: "Sundarbans Climate Adaptation Initiative",
                    impact: "85 villages protected from flooding, 30km embankments",
                    funding: "₹37.2Cr",
                    completion: "Feb 2025",
                  }
                ].map((project, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const detail: GovCompletedDetail = {
                        id: `completed-${index}`,
                        title: project.title,
                        completionDate: project.completion,
                        funding: project.funding,
                        impactSummary: project.impact,
                        outcomes: [
                          { label: "Primary Impact", value: project.impact },
                          { label: "Budget Utilization", value: "98%" },
                        ],
                        metrics: project.title.includes("Solar") ? { co2ReductionTons: 1800000 } : undefined,
                        lessons: ["Ensure early stakeholder alignment", "Buffer time for seasonal delays"]
                      }
                      setSelectedCompleted(detail)
                      setCompletedModalOpen(true)
                    }}
                  >
                    <div className="w-full h-24 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-lg mb-3 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">{project.title}</h4>
                    <p className="text-sm text-emerald-600 mb-2">{project.impact}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{project.funding}</span>
                      <Badge variant="outline">{project.completion}</Badge>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          const detail: GovCompletedDetail = {
                            id: `completed-${index}`,
                            title: project.title,
                            completionDate: project.completion,
                            funding: project.funding,
                            impactSummary: project.impact,
                            outcomes: [
                              { label: "Primary Impact", value: project.impact },
                              { label: "Budget Utilization", value: "98%" },
                            ],
                            metrics: project.title.includes("Solar") ? { co2ReductionTons: 1800000 } : undefined,
                            lessons: ["Ensure early stakeholder alignment", "Buffer time for seasonal delays"]
                          }
                          setSelectedCompleted(detail)
                          setCompletedModalOpen(true)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "impact-metrics":
        return (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Impact Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="co2">CO₂</TabsTrigger>
                  <TabsTrigger value="biodiversity">Biodiversity</TabsTrigger>
                  <TabsTrigger value="marine">Marine</TabsTrigger>
                </TabsList>
                <TabsContent value="co2" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Carbon Reduction</span>
                      <span className="font-medium">{carbonReductionCount.toLocaleString()} tons</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">75% of quarterly target achieved</p>
                  </div>
                </TabsContent>
                <TabsContent value="biodiversity" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Species Protected</span>
                      <span className="font-medium">{speciesCount} species</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">60% of annual target achieved</p>
                  </div>
                </TabsContent>
                <TabsContent value="marine" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ocean Area Cleaned</span>
                      <span className="font-medium">{oceanAreaCount} km²</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">85% of quarterly target achieved</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'government') {
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show loading
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If wrong role, redirect
  if (user.role !== 'government') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-700">Redirecting to appropriate dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-foreground">Government Portal</span>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, requests, or metrics..."
                className="pl-10 glass border-border/30"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => console.log("[v0] Notifications clicked")}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 glass border-r min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeSection === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "dashboard" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("dashboard")}
            >
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Button
              variant={activeSection === "new-requests" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "new-requests" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("new-requests")}
            >
              <FileText className="w-4 h-4 mr-3" />
              New Requests
              <Badge className="ml-auto bg-red-100 text-red-700">12</Badge>
            </Button>
            <Button
              variant={activeSection === "ongoing-projects" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "ongoing-projects" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("ongoing-projects")}
            >
              <Clock className="w-4 h-4 mr-3" />
              Ongoing Projects
            </Button>
            <Button
              variant={activeSection === "completed" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "completed" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("completed")}
            >
              <CheckCircle className="w-4 h-4 mr-3" />
              Completed
            </Button>
            <Button
              variant={activeSection === "impact-metrics" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "impact-metrics" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("impact-metrics")}
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Impact Metrics
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-6 space-y-6">{renderActiveSection()}</main>
      </div>

      {/* Detail Modals */}
      <GovRequestDetailsModal
        request={selectedRequest}
        open={requestModalOpen && selectedRequest !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRequestModalOpen(false)
            setSelectedRequest(null)
          }
        }}
      />

      <GovOngoingDetailsModal
        project={selectedOngoing}
        open={ongoingModalOpen && selectedOngoing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOngoingModalOpen(false)
            setSelectedOngoing(null)
          }
        }}
      />

      <GovCompletedDetailsModal
        project={selectedCompleted}
        open={completedModalOpen && selectedCompleted !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompletedModalOpen(false)
            setSelectedCompleted(null)
          }
        }}
      />
    </div>
  )
}
