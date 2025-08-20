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
  HandCoins,
  BarChart2,
  ArrowUp,
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react"
import { Line as ChartJSLine, Bar as ChartJSBar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartJSTooltip, ChartJSLegend)

function CardSparkLine({ labels, data, color = "#16a34a" }: { labels: string[]; data: number[]; color?: string }) {
  return (
    <div className="h-16 -mb-2">
      <ChartJSLine
        data={{
          labels,
          datasets: [{ data, borderColor: color, backgroundColor: color, tension: 0.35, pointRadius: 0 }],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          elements: { line: { borderWidth: 2 } },
        }}
      />
    </div>
  )
}

function AreaMini({ labels, data, color }: { labels: string[]; data: number[]; color: string }) {
  return (
    <div className="h-48">
      <ChartJSLine
        data={{
          labels,
          datasets: [
            {
              label: "Value",
              data,
              borderColor: color,
              pointRadius: 0,
              tension: 0.35,
              fill: true,
              backgroundColor: (ctx) => {
                const { ctx: c } = ctx.chart
                const g = c.createLinearGradient(0, 0, 0, 180)
                g.addColorStop(0, color + "55")
                g.addColorStop(1, color + "00")
                return g
              },
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: '#eee' } } },
        }}
      />
    </div>
  )
}

function LineActualTarget({ labels, actual, target, color }: { labels: string[]; actual: number[]; target: number[]; color: string }) {
  return (
    <div className="h-48">
      <ChartJSLine
        data={{
          labels,
          datasets: [
            { label: "Actual", data: actual, borderColor: color, backgroundColor: color, pointRadius: 0, tension: 0.35 },
            { label: "Target", data: target, borderColor: "#94a3b8", borderDash: [6, 6], pointRadius: 0, tension: 0.35 },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: 'top' } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: '#eee' } } },
          elements: { line: { borderWidth: 2 } },
        }}
      />
    </div>
  )
}

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
  const [needForFundingFilter, setNeedForFundingFilter] = useState<"all"|"high"|"medium"|"low">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState("accepted-proposals")
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<GovNewRequestDetail | null>(null)
  const [ongoingModalOpen, setOngoingModalOpen] = useState(false)
  const [selectedOngoing, setSelectedOngoing] = useState<GovOngoingDetail | null>(null)
  const [completedModalOpen, setCompletedModalOpen] = useState(false)
  const [selectedCompleted, setSelectedCompleted] = useState<GovCompletedDetail | null>(null)
  // New states for negotiation
  const [acceptedProposals, setAcceptedProposals] = useState<GovNewRequestDetail[]>([])
  const [negotiatingProposals, setNegotiatingProposals] = useState<GovNewRequestDetail[]>([])
  
  // Initialize with dummy data for demonstration
  useEffect(() => {
    // Sample proposals in negotiation
    const sampleNegotiating: GovNewRequestDetail[] = [
      {
        id: "negotiating-wetland",
        title: "Wetland Restoration Initiative",
        organization: "Blue Planet Foundation",
        location: "Kolkata, WB",
        priority: "Medium",
        description: "Comprehensive wetland restoration project aiming to revitalize 200 hectares of degraded wetlands in the East Kolkata region. The project includes hydrological restoration, native plant species reintroduction, and community-based monitoring initiatives to ensure long-term sustainability.",
        requestedFunding: "₹2.8Cr",
        fundingBreakdown: {
          total: "₹2.8Cr",
          projectAmount: "₹2.5Cr",
          ngoCommission: "₹20L",
          researcherCommission: "₹10L",
          ngoCommissionPercent: 7.1,
          researcherCommissionPercent: 3.6,
        },
        objectives: ["Restore 200 hectares of degraded wetlands", "Reintroduce native aquatic plant species", "Establish community monitoring program"],
        proposedTimeline: { start: "Nov 2025", end: "Oct 2027" },
        proposedImpact: { 
          summary: "Flood mitigation, water quality improvement, and biodiversity enhancement.", 
          areaRestoredHa: 200,
        },
        requirements: ["Environmental clearances", "Local community participation"],
        coordinator: { name: "Dr. Priya Banerjee", contact: "+91-94XXXXXX78" },
        negotiation: {
          status: "govt_offered",
          govtOffer: {
            total: "₹2.4Cr",
            projectAmount: "₹2.2Cr",
            ngoCommission: "₹14L",
            researcherCommission: "₹6L",
            ngoCommissionPercent: 5.8,
            researcherCommissionPercent: 2.5,
            notes: "We propose optimizing the budget by focusing on core restoration activities and reducing administrative overhead."
          }
        }
      },
      {
        id: "negotiating-tribal",
        title: "Tribal Forest Management Program",
        organization: "Indigenous Rights Coalition",
        location: "Ranchi, JH",
        priority: "High",
        description: "An initiative to empower tribal communities to manage forest resources sustainably through traditional knowledge integration, modern conservation techniques, and fair benefit-sharing mechanisms.",
        requestedFunding: "₹1.8Cr",
        fundingBreakdown: {
          total: "₹1.8Cr",
          projectAmount: "₹1.55Cr",
          ngoCommission: "₹15L",
          researcherCommission: "₹10L",
          ngoCommissionPercent: 8.3,
          researcherCommissionPercent: 5.6,
        },
        objectives: ["Train 20 tribal villages in sustainable forestry", "Establish 15 community seed banks", "Create market linkages for forest products"],
        proposedTimeline: { start: "Dec 2025", end: "Nov 2027" },
        proposedImpact: { 
          summary: "Forest conservation, livelihood enhancement, and cultural preservation.", 
          areaRestoredHa: 1200,
        },
        requirements: ["Tribal affairs ministry coordination", "Forest department permissions"],
        coordinator: { name: "Sanjay Munda", contact: "+91-85XXXXXX34" },
        negotiation: {
          status: "ngo_countered",
          govtOffer: {
            total: "₹1.5Cr",
            projectAmount: "₹1.3Cr",
            ngoCommission: "₹12L",
            researcherCommission: "₹8L",
            ngoCommissionPercent: 8.0,
            researcherCommissionPercent: 5.3,
            notes: "We propose a more focused approach with reduced operational costs."
          },
          ngoCounterOffer: {
            total: "₹1.65Cr",
            projectAmount: "₹1.42Cr",
            ngoCommission: "₹14L",
            researcherCommission: "₹9L",
            ngoCommissionPercent: 8.5,
            researcherCommissionPercent: 5.5,
            notes: "We've reduced the overall budget but need to maintain essential community engagement components that are critical for project success."
          }
        }
      },
      {
        id: "negotiating-river",
        title: "River Health Monitoring Network",
        organization: "Aquatic Conservation Society",
        location: "Varanasi, UP",
        priority: "Medium",
        description: "Establishment of a comprehensive river health monitoring network along a 120km stretch of the Ganga river, involving citizen scientists, modern sensors, and traditional knowledge systems for data collection and analysis.",
        requestedFunding: "₹3.2Cr",
        fundingBreakdown: {
          total: "₹3.2Cr",
          projectAmount: "₹2.9Cr",
          ngoCommission: "₹20L",
          researcherCommission: "₹10L",
          ngoCommissionPercent: 6.3,
          researcherCommissionPercent: 3.1,
        },
        objectives: ["Install 40 monitoring stations", "Train 200 citizen scientists", "Develop public dashboard for water quality data"],
        proposedTimeline: { start: "Oct 2025", end: "Sep 2027" },
        proposedImpact: { 
          summary: "Improved water governance, pollution reduction, and ecosystem restoration.", 
        },
        requirements: ["National Mission for Clean Ganga coordination", "University research partnerships"],
        coordinator: { name: "Dr. Abhishek Singh", contact: "+91-79XXXXXX12" },
        negotiation: {
          status: "ngo_countered",
          govtOffer: {
            total: "₹2.5Cr",
            projectAmount: "₹2.3Cr",
            ngoCommission: "₹12L",
            researcherCommission: "₹8L",
            ngoCommissionPercent: 4.8,
            researcherCommissionPercent: 3.2,
            notes: "We recommend focusing on core monitoring infrastructure and reducing the number of monitoring stations to 30."
          },
          ngoCounterOffer: {
            total: "₹2.8Cr",
            projectAmount: "₹2.6Cr",
            ngoCommission: "₹12L",
            researcherCommission: "₹8L",
            ngoCommissionPercent: 4.3,
            researcherCommissionPercent: 2.9,
            notes: "We've revised the overall scope while maintaining 35 monitoring stations which is the minimum needed for scientific validity. We've reduced our commission rates to accommodate."
          }
        }
      },
      {
        id: "negotiating-coral",
        title: "Coral Reef Restoration Project",
        organization: "Ocean Defenders Alliance",
        location: "Lakshadweep",
        priority: "High",
        description: "Large-scale coral reef restoration project using advanced propagation techniques and local community involvement to restore 5 hectares of degraded coral reefs in the Lakshadweep archipelago.",
        requestedFunding: "₹3.8Cr",
        fundingBreakdown: {
          total: "₹3.8Cr",
          projectAmount: "₹3.4Cr",
          ngoCommission: "₹25L",
          researcherCommission: "₹15L",
          ngoCommissionPercent: 6.6,
          researcherCommissionPercent: 3.9,
        },
        objectives: ["Restore 5 hectares of coral reef", "Train 50 local dive instructors in restoration techniques", "Establish 3 coral nurseries"],
        proposedTimeline: { start: "Jan 2026", end: "Dec 2028" },
        proposedImpact: { 
          summary: "Marine biodiversity enhancement, coastal protection, and ecotourism development.", 
          speciesProtected: 120,
        },
        requirements: ["Ministry of Environment clearances", "Local community agreements"],
        coordinator: { name: "Dr. Marina Shah", contact: "+91-99XXXXXX76" },
        negotiation: {
          status: "accepted",
          govtOffer: {
            total: "₹3.2Cr",
            projectAmount: "₹2.9Cr",
            ngoCommission: "₹20L",
            researcherCommission: "₹10L",
            ngoCommissionPercent: 6.3,
            researcherCommissionPercent: 3.1,
            notes: "We propose a more focused approach with emphasis on technology-assisted propagation to reduce costs."
          }
        }
      }
    ];
    
    // Sample accepted proposals with different negotiation statuses
    const sampleAccepted: GovNewRequestDetail[] = [
      {
        id: "accepted-urban-forest",
        title: "Urban Forest Restoration",
        organization: "Green Cities NGO",
        location: "Mumbai, MH",
        priority: "High",
        description: "Comprehensive urban forest restoration project aimed at planting 10,000 native trees across Mumbai's residential and commercial areas. The project focuses on improving air quality, reducing urban heat island effect, and creating green corridors for wildlife. Includes community engagement programs and long-term maintenance plans.",
        requestedFunding: "₹1.5Cr",
        fundingBreakdown: {
          total: "₹1.5Cr",
          projectAmount: "₹1.35Cr",
          ngoCommission: "₹10L",
          researcherCommission: "₹5L",
          ngoCommissionPercent: 6.7,
          researcherCommissionPercent: 3.3,
        },
        objectives: ["Plant 10,000 native trees in 12 wards", "Establish 5 community nurseries", "Develop maintenance MoUs with RWAs"],
        proposedTimeline: { start: "Oct 2025", end: "Sep 2026" },
        proposedImpact: { 
          summary: "Air quality improvement and urban biodiversity enhancement.", 
          treesPlanted: 10000, 
          co2ReductionTons: 150 
        },
        requirements: ["Local community support", "Municipal permissions"],
        coordinator: { name: "Anita Sharma", contact: "+91-98XXXXXX12" },
        negotiation: {
          status: "accepted",
          govtOffer: {
            total: "₹1.4Cr",
            projectAmount: "₹1.27Cr",
            ngoCommission: "₹8L",
            researcherCommission: "₹5L",
            ngoCommissionPercent: 5.7,
            researcherCommissionPercent: 3.6,
            notes: "We propose a slightly reduced budget with efficiency improvements in implementation."
          }
        },
        payment: {
          upiId: "greencities@upi",
          qrCode: "/placeholder-qr.png",
          status: "pending"
        }
      },
      {
        id: "accepted-mangrove",
        title: "Mangrove Conservation Project",
        organization: "Coastal Ecosystem Foundation",
        location: "Raigad, MH",
        priority: "Medium",
        description: "Project aimed at conserving and restoring 500 hectares of mangrove ecosystems along Maharashtra's coastline. Includes community-based monitoring systems, livelihood alternatives for local fishing communities, and educational programs on mangrove importance.",
        requestedFunding: "₹2.2Cr",
        fundingBreakdown: {
          total: "₹2.2Cr",
          projectAmount: "₹1.95Cr",
          ngoCommission: "₹15L",
          researcherCommission: "₹10L",
          ngoCommissionPercent: 6.8,
          researcherCommissionPercent: 4.5,
        },
        objectives: ["Restore 500 hectares of degraded mangroves", "Establish community monitoring system", "Create alternative livelihood programs"],
        proposedTimeline: { start: "Nov 2025", end: "Dec 2027" },
        proposedImpact: { 
          summary: "Coastal protection and marine biodiversity enhancement.", 
          areaRestoredHa: 500,
          speciesProtected: 35
        },
        requirements: ["Local fishing community engagement", "Coastal regulation zone permissions"],
        coordinator: { name: "Dr. Rajesh Menon", contact: "+91-87XXXXXX45" },
        negotiation: {
          status: "approved",
          govtOffer: {
            total: "₹2.0Cr",
            projectAmount: "₹1.8Cr",
            ngoCommission: "₹12L",
            researcherCommission: "₹8L",
            ngoCommissionPercent: 6.0,
            researcherCommissionPercent: 4.0,
            notes: "Approved with optimized budget allocation and stronger emphasis on community participation."
          }
        },
        payment: {
          upiId: "coastaleco@upi",
          status: "completed",
          receipt: "receipt-mangrove-123456.jpg",
          verificationStatus: "verified"
        }
      }
    ];
    
    // Filter accepted proposals to only include those that need payment (remove approved ones)
    const filteredAccepted = sampleAccepted.filter(p => p.negotiation?.status === 'accepted');
    
    setAcceptedProposals(filteredAccepted);
    setNegotiatingProposals(sampleNegotiating);
  }, []);

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

  // removed old funding filter controls; using needForFundingFilter

  const handleProjectAction = (projectId: string, action: string) => {
    console.log("[v0] Project action:", action, "for project:", projectId)
  }
  
  const handleAcceptProposal = (requestId: string) => {
    // Find the request in the list - either from projectRequests or from proposals with counter offers
    const request = projectRequests.find(r => r.id === requestId) || 
                    negotiatingProposals.find(r => r.id === requestId) ||
                    acceptedProposals.find(r => r.id === requestId);
    
    if (request) {
      // Create a copy with the updated negotiation status
      const updatedRequest = {
        ...request,
        negotiation: {
          ...request.negotiation,
          status: "accepted" as const
        }
      };
      
      // In a real app, you'd make an API call here
      console.log("[v0] Accepting proposal for project:", requestId);
      
      // Update accepted proposals list
      setAcceptedProposals(prev => {
        // Remove existing entry if it exists
        const filtered = prev.filter(p => p.id !== requestId);
        return [...filtered, updatedRequest];
      });
      
      // Set active section to accepted-proposals to see the results
      setActiveSection("accepted-proposals");
      
      // Close modal
      setRequestModalOpen(false);
      setSelectedRequest(null);
    }
  }
  
  const handleSendOffer = (requestId: string, offerDetails: any) => {
    // Find the request in the list from any possible source
    const request = projectRequests.find(r => r.id === requestId) || 
                    negotiatingProposals.find(r => r.id === requestId) ||
                    acceptedProposals.find(r => r.id === requestId);
                    
    if (request) {
      // Create a copy with the updated negotiation info
      const updatedRequest = {
        ...request,
        negotiation: {
          status: "govt_offered" as const,
          govtOffer: offerDetails
        }
      };
      
      // In a real app, you'd make an API call here
      console.log("[v0] Sending counter offer for project:", requestId, offerDetails);
      
      // Update negotiating proposals list
      setNegotiatingProposals(prev => {
        // Remove existing entry if it exists
        const filtered = prev.filter(p => p.id !== requestId);
        return [...filtered, updatedRequest];
      });
      
      // For demonstration purposes, let's also add to accepted proposals after a slight delay
      setTimeout(() => {
        const acceptedRequest = {
          ...updatedRequest,
          negotiation: {
            ...updatedRequest.negotiation,
            status: "accepted" as const
          }
        };
        
        setAcceptedProposals(prev => {
          // Remove existing entry if it exists
          const filtered = prev.filter(p => p.id !== requestId);
          return [...filtered, acceptedRequest];
        });
        
        // Change to accepted-proposals tab to show the result
        setActiveSection("accepted-proposals");
      }, 500);
      
      // Close modal
      setRequestModalOpen(false);
      setSelectedRequest(null);
    }
  }
  
  const handleApproveProject = (requestId: string) => {
    // Find the request in the list
    const request = acceptedProposals.find(r => r.id === requestId);
    if (request) {
      // Create a copy with the updated negotiation status
      const updatedRequest = {
        ...request,
        negotiation: {
          ...request.negotiation,
          status: "approved" as const
        }
      };
      
      // In a real app, you'd make an API call here
      console.log("[v0] Approving project:", requestId);
      
      // Update the accepted proposals list
      setAcceptedProposals(prev => {
        const filtered = prev.filter(p => p.id !== requestId);
        return [...filtered, updatedRequest];
      });
      
      // Close modal
      setRequestModalOpen(false);
      setSelectedRequest(null);
    }
  }
  
  const handleUploadPaymentReceipt = (requestId: string, receipt: string) => {
    // Find the request in the list
    const request = acceptedProposals.find(r => r.id === requestId);
    if (request) {
      // Create a copy with the updated payment info
      const updatedRequest = {
        ...request,
        payment: {
          ...request.payment,
          receipt: receipt,
          status: "completed" as const,
          verificationStatus: "pending" as const
        },
        negotiation: {
          ...request.negotiation,
          status: "approved" as const
        }
      };
      
      // In a real app, you'd make an API call here
      console.log("[v0] Upload payment receipt for project:", requestId, receipt);
      
      // Update accepted proposals list with the payment receipt
      setAcceptedProposals(prev => {
        const filtered = prev.filter(p => p.id !== requestId);
        return [...filtered, updatedRequest];
      });
      
      // Close modal
      setRequestModalOpen(false);
      setSelectedRequest(null);
    }
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
      fundingBreakdown: {
        total: "₹1.5Cr",
        projectAmount: "₹1.35Cr",
        ngoCommission: "₹10L",
        researcherCommission: "₹5L",
        ngoCommissionPercent: 6.7,
        researcherCommissionPercent: 3.3,
      },
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
      fundingBreakdown: {
        total: "₹80L",
        projectAmount: "₹72L",
        ngoCommission: "₹5L",
        researcherCommission: "₹3L",
        ngoCommissionPercent: 6.25,
        researcherCommissionPercent: 3.75,
      },
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
      fundingBreakdown: {
        total: "₹2.7Cr",
        projectAmount: "₹2.52Cr",
        ngoCommission: "₹12L",
        researcherCommission: "₹6L",
        ngoCommissionPercent: 4.4,
        researcherCommissionPercent: 2.2,
      },
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
      fundingBreakdown: {
        total: "₹3.8Cr",
        projectAmount: "₹3.55Cr",
        ngoCommission: "₹18L",
        researcherCommission: "₹7L",
        ngoCommissionPercent: 4.7,
        researcherCommissionPercent: 1.8,
      },
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
      fundingBreakdown: {
        total: "₹1.2Cr",
        projectAmount: "₹1.1Cr",
        ngoCommission: "₹6L",
        researcherCommission: "₹4L",
        ngoCommissionPercent: 5,
        researcherCommissionPercent: 3.3,
      },
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
      fundingBreakdown: {
        total: "₹4.5Cr",
        projectAmount: "₹4.2Cr",
        ngoCommission: "₹20L",
        researcherCommission: "₹10L",
        ngoCommissionPercent: 4.4,
        researcherCommissionPercent: 2.2,
      },
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
      fundingBreakdown: {
        total: "₹2.2Cr",
        projectAmount: "₹2.04Cr",
        ngoCommission: "₹10L",
        researcherCommission: "₹6L",
        ngoCommissionPercent: 4.5,
        researcherCommissionPercent: 2.7,
      },
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
                  <div className="mt-3">
                    <CardSparkLine labels={["Apr","May","Jun","Jul","Aug"]} data={[120,130,128,138,142]} color="#2563eb" />
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
                  <div className="mt-3">
                    <CardSparkLine labels={["Apr","May","Jun","Jul","Aug"]} data={[22,28,25,31,37]} color="#f59e0b" />
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
                  <div className="mt-3">
                    <CardSparkLine labels={["Apr","May","Jun","Jul","Aug"]} data={[4.1,4.5,4.9,5.3,5.7].map(n=>n*83)} color="#10b981" />
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
                  <div className="mt-3">
                    <CardSparkLine labels={["Apr","May","Jun","Jul","Aug"]} data={[1800,2100,2400,2650,2850]} color="#22c55e" />
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

      case "negotiating-proposals":
        return (
          <Card className="glass h-[calc(100vh-120px)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-serif">Proposals in Negotiation</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-orange-100 text-orange-700">
                  Government Offered: {negotiatingProposals.filter(p => p.negotiation?.status === 'govt_offered').length}
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                  NGO Countered: {negotiatingProposals.filter(p => p.negotiation?.status === 'ngo_countered').length}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  Ready for Payment: {negotiatingProposals.filter(p => p.negotiation?.status === 'accepted').length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="space-y-4">
                {negotiatingProposals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No proposals in negotiation</p>
                    <p className="text-sm">Project negotiations will appear here</p>
                  </div>
                ) : (
                  <>
                    {/* Government offered proposals */}
                    {negotiatingProposals.filter(p => p.negotiation?.status === 'govt_offered').length > 0 && (
                      <>
                        <h3 className="text-md font-medium flex items-center gap-2 mt-2 mb-3">
                          <ArrowDown className="w-4 h-4 text-orange-500" /> Awaiting NGO Response
                        </h3>
                        {negotiatingProposals
                          .filter(p => p.negotiation?.status === 'govt_offered')
                          .map((proposal) => (
                            <div
                              key={proposal.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200"
                              onClick={() => {
                                setSelectedRequest(proposal)
                                setRequestModalOpen(true)
                              }}
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                  {proposal.title}
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700 ml-2">Awaiting Response</Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground">{proposal.organization}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {proposal.location}
                                  </span>
                                  <span className="flex items-center">
                                    <ArrowDownRight className="w-3 h-3 mr-1 text-green-600" />
                                    Offered: {proposal.negotiation?.govtOffer?.total}
                                  </span>
                                  <span className="flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    Requested: {proposal.requestedFunding}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequest(proposal);
                                  setRequestModalOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          ))}
                      </>
                    )}
                    
                    {/* NGO countered proposals */}
                    {negotiatingProposals.filter(p => p.negotiation?.status === 'ngo_countered').length > 0 && (
                      <>
                        <h3 className="text-md font-medium flex items-center gap-2 mt-6 mb-3">
                          <ArrowUp className="w-4 h-4 text-purple-500" /> Counter Offers Received
                        </h3>
                        {negotiatingProposals
                          .filter(p => p.negotiation?.status === 'ngo_countered')
                          .map((proposal) => (
                            <div
                              key={proposal.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                              onClick={() => {
                                setSelectedRequest(proposal)
                                setRequestModalOpen(true)
                              }}
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                  {proposal.title}
                                  <Badge variant="outline" className="bg-purple-100 text-purple-700 ml-2">Counter Offer</Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground">{proposal.organization}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {proposal.location}
                                  </span>
                                  <span className="flex items-center">
                                    <ArrowDownRight className="w-3 h-3 mr-1 text-green-600" />
                                    Your offer: {proposal.negotiation?.govtOffer?.total}
                                  </span>
                                  <span className="flex items-center">
                                    <ArrowUpRight className="w-3 h-3 mr-1 text-purple-600" />
                                    Counter: {proposal.negotiation?.ngoCounterOffer?.total}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequest(proposal);
                                  setRequestModalOpen(true);
                                }}
                              >
                                Review Offer
                              </Button>
                            </div>
                          ))}
                      </>
                    )}
                    
                    {/* Accepted proposals awaiting payment */}
                    {negotiatingProposals.filter(p => p.negotiation?.status === 'accepted').length > 0 && (
                      <>
                        <h3 className="text-md font-medium flex items-center gap-2 mt-6 mb-3">
                          <CheckCircle className="w-4 h-4 text-green-500" /> Ready for Payment
                        </h3>
                        {negotiatingProposals
                          .filter(p => p.negotiation?.status === 'accepted')
                          .map((proposal) => (
                            <div
                              key={proposal.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer border border-green-200"
                              onClick={() => {
                                setSelectedRequest(proposal)
                                setRequestModalOpen(true)
                              }}
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                  {proposal.title}
                                  <Badge variant="outline" className="bg-green-100 text-green-700 ml-2">Ready for Payment</Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground">{proposal.organization}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {proposal.location}
                                  </span>
                                  <span className="flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1 text-green-600" />
                                    Final Amount: {proposal.negotiation?.govtOffer?.total}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequest(proposal);
                                  setRequestModalOpen(true);
                                }}
                              >
                                Process Payment
                              </Button>
                            </div>
                          ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
        
      case "accepted-proposals":
        return (
          <Card className="glass h-[calc(100vh-120px)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-serif">Approved Proposals</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  Ready for Payment: {acceptedProposals.filter(p => p.negotiation?.status === 'accepted').length}
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  Approved: {acceptedProposals.filter(p => p.negotiation?.status === 'approved').length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="space-y-4">
                {acceptedProposals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HandCoins className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No accepted proposals yet</p>
                    <p className="text-sm">Proposals that you accept will appear here</p>
                  </div>
                ) : (
                  <>
                    {acceptedProposals.filter(p => p.negotiation?.status === 'accepted').length > 0 && (
                      <>
                        <h3 className="text-md font-medium flex items-center gap-2 mt-2 mb-3">
                          <DollarSign className="w-4 h-4" /> Ready for Payment
                        </h3>
                        {acceptedProposals
                          .filter(p => p.negotiation?.status === 'accepted')
                          .map((proposal) => (
                            <div
                              key={proposal.id}
                              className="p-4 rounded-lg border border-green-100 bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedRequest(proposal);
                                setRequestModalOpen(true);
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{proposal.title}</h3>
                                  <Badge variant="outline" className="bg-green-100 text-green-700">
                                    Payment Pending
                                  </Badge>
                                </div>
                                <Button variant="outline" size="sm" className="bg-green-100 hover:bg-green-200 border-green-200">
                                  Make Payment
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span className="font-medium text-green-700">{proposal.organization}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {proposal.location}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-sm">
                                <div className="p-2 bg-white/70 rounded border border-green-100">
                                  <span className="text-muted-foreground">Original Request</span>
                                  <div className="font-medium">{proposal.requestedFunding}</div>
                                </div>
                                <div className="p-2 bg-white/70 rounded border border-green-100">
                                  <span className="text-muted-foreground">Your Offer</span>
                                  <div className="font-medium">{proposal.negotiation?.govtOffer?.total}</div>
                                </div>
                                <div className="p-2 bg-white/70 rounded border border-green-100">
                                  <span className="text-muted-foreground">Timeline</span>
                                  <div className="font-medium">{proposal.proposedTimeline.start} - {proposal.proposedTimeline.end}</div>
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                {proposal.negotiation?.govtOffer?.notes && (
                                  <p className="italic">Note: {proposal.negotiation.govtOffer.notes}</p>
                                )}
                                <p className="mt-1">Click to view complete details and process payment</p>
                              </div>
                            </div>
                        ))}
                      </>
                    )}
                    
                    {acceptedProposals.filter(p => p.negotiation?.status === 'approved').length > 0 && (
                      <>
                        <h3 className="text-md font-medium flex items-center gap-2 mt-4 mb-3">
                          <CheckCircle className="w-4 h-4" /> Approved Projects
                        </h3>
                        {acceptedProposals
                          .filter(p => p.negotiation?.status === 'approved')
                          .map((proposal) => (
                            <div
                              key={proposal.id}
                              className="p-4 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedRequest(proposal);
                                setRequestModalOpen(true);
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{proposal.title}</h3>
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                    Payment Verified
                                  </Badge>
                                </div>
                                <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 border-blue-200">
                                  Track Progress
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span className="font-medium text-blue-700">{proposal.organization}</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {proposal.location}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-sm">
                                <div className="p-2 bg-white/70 rounded border border-blue-100">
                                  <span className="text-muted-foreground">Final Amount</span>
                                  <div className="font-medium">{proposal.negotiation?.govtOffer?.total}</div>
                                </div>
                                <div className="p-2 bg-white/70 rounded border border-blue-100">
                                  <span className="text-muted-foreground">Payment Status</span>
                                  <div className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span className="font-medium">Verified</span>
                                  </div>
                                </div>
                                <div className="p-2 bg-white/70 rounded border border-blue-100">
                                  <span className="text-muted-foreground">Timeline</span>
                                  <div className="font-medium">{proposal.proposedTimeline.start} - {proposal.proposedTimeline.end}</div>
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                <p>Click to view complete project details and monitor progress</p>
                              </div>
                            </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
        
      case "new-requests":
        return (
          <Card className="glass h-[calc(100vh-120px)]">
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
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
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
          <Card className="glass h-[calc(100vh-120px)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-serif">Ongoing Projects</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={needForFundingFilter === "all" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                  onClick={() => setNeedForFundingFilter("all")}
                >
                  All Needs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={needForFundingFilter === "high" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                  onClick={() => setNeedForFundingFilter("high")}
                >
                  High Need
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={needForFundingFilter === "medium" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                  onClick={() => setNeedForFundingFilter("medium")}
                >
                  Medium Need
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={needForFundingFilter === "low" ? "bg-primary text-primary-foreground" : "bg-transparent"}
                  onClick={() => setNeedForFundingFilter("low")}
                >
                  Low Need
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="space-y-4">
                {[ 
                  {
                    title: "National Solar Mission Phase III",
                    progress: 72,
                    funding: "₹24.5Cr",
                    deadline: "Mar 2025",
                    status: "On Track",
                    needForFunding: "medium",
                  },
                  {
                    title: "Yamuna Floodplain Restoration",
                    progress: 45,
                    funding: "₹12.8Cr",
                    deadline: "Jul 2025",
                    status: "Delayed",
                    needForFunding: "high",
                  },
                  {
                    title: "National Clean Air Programme - Delhi Phase",
                    progress: 88,
                    funding: "₹18.6Cr",
                    deadline: "Dec 2024",
                    status: "Ahead",
                    needForFunding: "low",
                  },
                  {
                    title: "Namami Gange - Varanasi Segment",
                    progress: 65,
                    funding: "₹32.7Cr",
                    deadline: "Apr 2025",
                    status: "On Track",
                    needForFunding: "medium",
                  },
                  {
                    title: "Sustainable Himalayan Ecosystem Initiative",
                    progress: 51,
                    funding: "₹27.5Cr",
                    deadline: "Sep 2025",
                    status: "On Track",
                    needForFunding: "high",
                  },
                  {
                    title: "Kutch Mangrove Restoration Project",
                    progress: 92,
                    funding: "₹8.4Cr",
                    deadline: "Nov 2024",
                    status: "Ahead",
                    needForFunding: "low",
                  },
                  {
                    title: "Tamil Nadu Coastal Zone Protection",
                    progress: 37,
                    funding: "₹16.2Cr",
                    deadline: "Aug 2025",
                    status: "Delayed",
                    needForFunding: "high",
                  }
                ]
                // Filter based on needForFunding UI selection
                .filter(p => needForFundingFilter === "all" ? true : p.needForFunding === needForFundingFilter)
                .map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      const detail: GovOngoingDetail = {
                        id: `ongoing-${index}`,
                        title: project.title,
                        funding: project.funding,
                        status: project.status as GovOngoingDetail["status"],
                        progress: project.progress,
                        deadline: project.deadline,
                        needForFunding: project.needForFunding as any,
                        additionalFundingNeeded: project.needForFunding === "high" ? "₹5.0Cr" : project.needForFunding === "medium" ? "₹2.0Cr" : "₹0.5Cr",
                        fundingNeedReason: project.needForFunding === "high" ? [
                          "Scope expansion to additional districts",
                          "Increased material costs due to market volatility",
                          "Contingency buffer for monsoon disruptions",
                        ] : project.needForFunding === "medium" ? [
                          "Acceleration of community outreach",
                          "Upgrade of monitoring equipment",
                        ] : [
                          "Buffer for unforeseen field logistics",
                        ],
                        dailyWork: [
                          { date: "Aug 14", tasks: ["Field survey", "Vendor RFQs"], progress: Math.max(0, project.progress - 12) },
                          { date: "Aug 15", tasks: ["Community meeting", "Material dispatch"], progress: Math.max(0, project.progress - 8) },
                          { date: "Aug 16", tasks: ["Site prep", "Permit follow-up"], progress: Math.max(0, project.progress - 6) },
                          { date: "Aug 17", tasks: ["Installation", "Training"], progress: Math.max(0, project.progress - 4) },
                          { date: "Aug 18", tasks: ["Quality checks", "Data logging"], progress: Math.max(0, project.progress - 2) },
                          { date: "Aug 19", tasks: ["Implementation", "Stakeholder review"], progress: project.progress },
                        ],
                        metricsSeries: [
                          { date: "Aug 14", progress: Math.max(0, project.progress - 12), target: 50 },
                          { date: "Aug 15", progress: Math.max(0, project.progress - 8), target: 55 },
                          { date: "Aug 16", progress: Math.max(0, project.progress - 6), target: 60 },
                          { date: "Aug 17", progress: Math.max(0, project.progress - 4), target: 65 },
                          { date: "Aug 18", progress: Math.max(0, project.progress - 2), target: 70 },
                          { date: "Aug 19", progress: project.progress, target: 75 },
                        ],
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
                        <Badge variant="outline" className="capitalize">Need: {project.needForFunding}</Badge>
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
          <Card className="glass h-[calc(100vh-120px)]">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Recently Completed Projects</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
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

      case "unsdg":
        return (
              <Card className="glass h-[calc(100vh-120px)]">
            <CardHeader>
              <CardTitle className="text-lg font-serif">UN Sustainable Development Goals</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sdg13">Goal 13: Climate Action</TabsTrigger>
                  <TabsTrigger value="sdg14">Goal 14: Life Below Water</TabsTrigger>
                  <TabsTrigger value="sdg15">Goal 15: Life On Land</TabsTrigger>
                </TabsList>
                <TabsContent value="sdg13" className="mt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#3f7e44] flex items-center justify-center text-white font-bold">
                        SDG 13
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Climate Action</h3>
                        <p className="text-muted-foreground">Take urgent action to combat climate change and its impacts</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Carbon Emissions */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Carbon Emissions</span>
                            <Badge variant="outline" className="bg-[#3f7e44]/10">{carbonReductionCount.toLocaleString()} tons</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[1800, 2100, 2400, 2650, 2850]}
                            target={[1900, 2200, 2500, 2800, 3200]}
                            color="#3f7e44"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">89% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Renewable Energy */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Renewable Energy</span>
                            <Badge variant="outline" className="bg-[#3f7e44]/10">28%</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[16, 18, 22, 25, 28]}
                            target={[18, 22, 28, 35, 40]}
                            color="#3f7e44"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">70% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Climate Resilient Communities */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Climate Resilient Communities</span>
                            <Badge variant="outline" className="bg-[#3f7e44]/10">142</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[86, 95, 110, 128, 142]}
                            target={[90, 110, 130, 160, 200]}
                            color="#3f7e44"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">71% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Key Targets</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>Strengthen resilience to climate-related hazards</li>
                        <li>Integrate climate change measures into policies</li>
                        <li>Improve education and awareness on climate change</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="sdg14" className="mt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#0a97d9] flex items-center justify-center text-white font-bold">
                        SDG 14
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Life Below Water</h3>
                        <p className="text-muted-foreground">Conserve and sustainably use the oceans, seas and marine resources</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Marine Areas Protected */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Marine Areas Protected</span>
                            <Badge variant="outline" className="bg-[#0a97d9]/10">35%</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[22, 25, 28, 32, 35]}
                            target={[25, 30, 35, 43, 50]}
                            color="#0a97d9"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">70% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Ocean Area Cleaned */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Ocean Area Cleaned</span>
                            <Badge variant="outline" className="bg-[#0a97d9]/10">{oceanAreaCount} km²</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[520, 610, 690, 740, 780]}
                            target={[550, 650, 750, 850, 1000]}
                            color="#0a97d9"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">78% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Fish Stocks */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Fish Stocks at Sustainable Levels</span>
                            <Badge variant="outline" className="bg-[#0a97d9]/10">72%</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[59, 63, 68, 70, 72]}
                            target={[65, 70, 75, 80, 85]}
                            color="#0a97d9"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">85% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Key Targets</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>Prevent and reduce marine pollution</li>
                        <li>Sustainably manage and protect marine ecosystems</li>
                        <li>Minimize impacts of ocean acidification</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="sdg15" className="mt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#56c02b] flex items-center justify-center text-white font-bold">
                        SDG 15
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Life on Land</h3>
                        <p className="text-muted-foreground">Protect, restore and promote sustainable use of terrestrial ecosystems</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Forest Area */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Forest Area</span>
                            <Badge variant="outline" className="bg-[#56c02b]/10">32%</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[27, 28, 30, 31, 32]}
                            target={[28, 30, 33, 36, 40]}
                            color="#56c02b"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">80% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Species Protected */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Species Protected</span>
                            <Badge variant="outline" className="bg-[#56c02b]/10">{speciesCount} species</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[24, 33, 41, 47, 47]}
                            target={[30, 40, 45, 52, 60]}
                            color="#56c02b"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">78% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Land Restored */}
                      <Card className="glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Land Restored</span>
                            <Badge variant="outline" className="bg-[#56c02b]/10">1250 hectares</Badge>
                          </div>
                          <LineActualTarget
                            labels={["Apr","May","Jun","Jul","Aug"]}
                            actual={[650, 820, 980, 1100, 1250]}
                            target={[800, 1000, 1300, 1600, 2000]}
                            color="#56c02b"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-muted-foreground">Current progress</span>
                            <span className="font-medium">63% of target</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Key Targets</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>Ensure conservation and sustainable use of ecosystems</li>
                        <li>Promote sustainable forest management</li>
                        <li>Combat desertification and restore degraded land</li>
                      </ul>
                    </div>
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
              className={`w-full justify-between items-center ${
                activeSection === "dashboard" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("dashboard")}
            >
              <div className="flex items-center">
                <LayoutDashboard className="w-4 h-4 mr-3" />
                <span>Dashboard</span>
              </div>
            </Button>
            <Button
              variant={activeSection === "new-requests" ? "default" : "ghost"}
              className={`w-full justify-between items-center ${
                activeSection === "new-requests" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("new-requests")}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-3" />
                <span>New Requests</span>
              </div>
              <Badge className="bg-red-100 text-red-700">12</Badge>
            </Button>
            <Button
              variant={activeSection === "negotiating-proposals" ? "default" : "ghost"}
              className={`w-full justify-between items-center ${
                activeSection === "negotiating-proposals" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("negotiating-proposals")}
            >
              <div className="flex items-center">
                <BarChart2 className="w-4 h-4 mr-3" />
                <span>Negotiating Projects</span>
              </div>
              {negotiatingProposals.length > 0 && (
                <div className="flex gap-1">
                  {negotiatingProposals.filter(p => p.negotiation?.status === 'govt_offered').length > 0 && (
                    <Badge className="bg-orange-100 text-orange-700">
                      {negotiatingProposals.filter(p => p.negotiation?.status === 'govt_offered').length}
                    </Badge>
                  )}
                  {negotiatingProposals.filter(p => p.negotiation?.status === 'ngo_countered').length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700">
                      {negotiatingProposals.filter(p => p.negotiation?.status === 'ngo_countered').length}
                    </Badge>
                  )}
                  {negotiatingProposals.filter(p => p.negotiation?.status === 'accepted').length > 0 && (
                    <Badge className="bg-green-100 text-green-700">
                      {negotiatingProposals.filter(p => p.negotiation?.status === 'accepted').length}
                    </Badge>
                  )}
                </div>
              )}
            </Button>
            
            <Button
              variant={activeSection === "accepted-proposals" ? "default" : "ghost"}
              className={`w-full justify-between items-center ${
                activeSection === "accepted-proposals" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("accepted-proposals")}
            >
              <div className="flex items-center">
                <HandCoins className="w-4 h-4 mr-3" />
                <span>Approved Projects</span>
              </div>
              {acceptedProposals.length > 0 && (
                <Badge className="bg-blue-100 text-blue-700">
                  {acceptedProposals.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeSection === "ongoing-projects" ? "default" : "ghost"}
              className={`w-full justify-between items-center ${
                activeSection === "ongoing-projects" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("ongoing-projects")}
            >
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-3" />
                <span>Ongoing Projects</span>
              </div>
            </Button>
            <Button
              variant={activeSection === "completed" ? "default" : "ghost"}
              className={`w-full justify-between items-center ${
                activeSection === "completed" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("completed")}
            >
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-3" />
                <span>Completed</span>
              </div>
            </Button>
            <Button
              variant={activeSection === "unsdg" ? "default" : "ghost"}
              className={`w-full justify-between items-center ${
                activeSection === "unsdg" ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleSidebarClick("unsdg")}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-3" />
                <span>UNSDG</span>
              </div>
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
        onAcceptProposal={handleAcceptProposal}
        onSendOffer={handleSendOffer}
        onApproveProject={handleApproveProject}
        onUploadPaymentReceipt={handleUploadPaymentReceipt}
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
