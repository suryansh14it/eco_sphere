"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { UserMenu } from "@/components/user-menu"
import { NGOSelectionModal } from "@/components/researcher/ngo-selection-modal"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Bell,
  User,
  MapPin,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Waves,
  TreePine,
  BarChart3,
  PlusCircle,
  Filter,
  Download,
  Share,
  CheckCircle,
  Info,
  MessageCircle,
  X
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
} from "chart.js"
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2"
import { ReportedIssueModal, type ReportedIssueData } from "@/components/researcher/reported-issue-modal"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

export default function ResearcherDashboard() {
  const [activeTab, setActiveTab] = useState("sdg13");
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedIssue, setSelectedIssue] = useState<ReportedIssueData | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isNGOModalOpen, setIsNGOModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    sdgFocus: "",
    location: "Manila Bay",
    fundingRequested: "",
    description: "",
    duration: "",
    commission: ""
  });
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  // Handle ESC key to close chatbot
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isChatbotOpen) {
        setIsChatbotOpen(false);
      }
    };

    if (isChatbotOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isChatbotOpen]);
  
  // Handle form data changes
  const handleFormDataChange = (field: string, value: string) => {
    setProjectFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!projectFormData.title || !projectFormData.sdgFocus || !projectFormData.location) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields: Project Title, SDG Focus, and Location.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    if (!user) {
      toast({
        title: "🔐 Authentication Required",
        description: "Please log in to submit a project proposal.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    // If NGO is already selected, submit directly
    if (selectedNGO) {
      await submitProjectProposal(selectedNGO);
    } else {
      // Show NGO selection modal first
      setIsNGOModalOpen(true);
    }
  };

  // Extract submission logic into a separate function
  const submitProjectProposal = async (ngo: any) => {
    try {
      const submissionData = {
        ...projectFormData,
        selectedNGO: ngo,
        researcherId: user?.id,
        researcherEmail: user?.email,
        researcherName: user?.name || user?.email
      };

      const response = await fetch('/api/project-proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        // Show success toast
        toast({
          title: "🎉 Project Proposal Submitted!",
          description: `Your research project "${submissionData.title}" has been successfully submitted and is now under review. You'll receive updates on its progress.`,
          duration: 5000,
        });
        
        // Reset form
        setProjectFormData({
          title: "",
          sdgFocus: "",
          location: "Manila Bay",
          fundingRequested: "",
          description: "",
          duration: "",
          commission: ""
        });
        setSelectedNGO(null);
        setIsNGOModalOpen(false);
      } else {
        // Show error toast
        toast({
          title: "❌ Submission Failed",
          description: result.error || "There was an error submitting your project proposal. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        setIsNGOModalOpen(false);
      }
    } catch (error) {
      console.error('Error submitting project proposal:', error);
      // Show error toast
      toast({
        title: "❌ Submission Failed",
        description: "Failed to submit project proposal. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsNGOModalOpen(false);
    }
  };

  // Handle NGO selection
  const handleNGOSelection = async (ngo: any) => {
    setSelectedNGO(ngo);
    console.log("Selected NGO:", ngo);
    
    // Close modal and submit
    setIsNGOModalOpen(false);
    await submitProjectProposal(ngo);
  };

  
  // Sample reported issues data
  const reportedIssues = {
    sdg13: [
      {
        id: "CI001",
        title: "Arctic Ice Melting Acceleration",
        description: "Satellite data indicates accelerated rate of ice melting in the Arctic region, with a 15% increase in melt rate compared to previous years. This is causing disruption to local ecosystems and contributing to rising sea levels globally.",
        location: "Greenland",
        coordinates: {
          lat: 72.1376,
          lng: -43.2587
        },
        date: "2025-07-21",
        time: "14:32 UTC",
        reporter: {
          name: "Dr. Sarah Johnson",
          role: "Climate Scientist",
          id: "SJ2453"
        },
        category: "Climate Change",
        severity: "Critical" as const,
        status: "Verified" as const,
        aiConfidence: 95,
        tags: ["Arctic", "Ice Loss", "Sea Level Rise", "Climate"],
        images: [
          "https://images.unsplash.com/photo-1520617503724-80db7230b7c8?q=80&w=600&auto=format",
          "https://images.unsplash.com/photo-1534284436880-a4d60dae3469?q=80&w=600&auto=format"
        ],
        environmentalData: {
          temperature: -5.2,
          humidity: 65,
          airQuality: 22,
          waterQuality: 87
        },
        impactAssessment: {
          immediate: "Disruption to local marine ecosystems and indigenous communities",
          longTerm: "Contributes to global sea level rise and changes in ocean circulation patterns",
          radius: 500
        },
        recommendedActions: [
          "Deploy additional monitoring stations",
          "Engage local communities in adaptive planning",
          "Integrate findings into climate models",
          "Expedite marine conservation efforts in affected areas"
        ],
        relatedIssues: [
          {
            id: "WL002",
            title: "Polar Bear Habitat Loss"
          },
          {
            id: "OA005",
            title: "Ocean Acidification Increase"
          }
        ],
        comments: [
          {
            user: "Dr. Michael Chen",
            text: "The melt rate acceleration matches our model predictions from last year. We should compare these findings with the IPCC latest report.",
            timestamp: "2025-07-22 09:15 UTC"
          },
          {
            user: "Prof. Elena Rodriguez",
            text: "I'm concerned about the impact on krill populations. This could have cascading effects through the food chain.",
            timestamp: "2025-07-22 14:38 UTC"
          }
        ]
      },
      {
        id: "CI002",
        title: "Drought Intensification",
        description: "Severe drought conditions are intensifying across East Africa, with rainfall 60% below normal levels. This is causing crop failures, water shortages, and humanitarian concerns.",
        location: "East Africa",
        coordinates: {
          lat: 4.0435,
          lng: 39.6682
        },
        date: "2025-07-18",
        time: "09:15 UTC",
        reporter: {
          name: "Dr. Thomas Mbeki",
          role: "Hydrologist",
          id: "TM1187"
        },
        category: "Water Security",
        severity: "Critical" as const,
        status: "Action Needed" as const,
        aiConfidence: 92,
        tags: ["Drought", "Water", "Agriculture", "Climate"],
        images: [
          "https://images.unsplash.com/photo-1594412228528-b93d95a2f2d7?q=80&w=600&auto=format"
        ],
        environmentalData: {
          temperature: 38.7,
          humidity: 18,
          airQuality: 75,
          soilQuality: 32
        },
        impactAssessment: {
          immediate: "Crop failure and water shortages affecting 2.5 million people",
          longTerm: "Desertification, migration, and regional instability",
          radius: 850
        },
        recommendedActions: [
          "Emergency water distribution systems",
          "Implementation of drought-resistant agricultural practices",
          "Development of early warning systems",
          "Investment in water harvesting infrastructure"
        ],
        relatedIssues: [
          {
            id: "FS009",
            title: "Food Security Crisis"
          },
          {
            id: "WM004",
            title: "Groundwater Depletion"
          }
        ],
        comments: [
          {
            user: "Dr. Amina Hassan",
            text: "Local communities are reporting livestock losses. We need to expedite the emergency response.",
            timestamp: "2025-07-19 11:27 UTC"
          }
        ]
      }
    ],
    sdg14: [
      {
        id: "OI001",
        title: "Coral Bleaching Event",
        description: "Extensive coral bleaching observed across 65% of the Great Barrier Reef's northern section, triggered by elevated sea temperatures. This is the fourth major bleaching event in 8 years.",
        location: "Great Barrier Reef",
        coordinates: {
          lat: -18.2871,
          lng: 147.6992
        },
        date: "2025-07-15",
        time: "06:45 UTC",
        reporter: {
          name: "Dr. Amanda Whitmore",
          role: "Marine Biologist",
          id: "AW3567"
        },
        category: "Marine Ecosystem",
        severity: "Critical" as const,
        status: "Verified" as const,
        aiConfidence: 88,
        tags: ["Coral", "Ocean", "Temperature", "Biodiversity"],
        images: [
          "https://images.unsplash.com/photo-1566210224649-61218f626668?q=80&w=600&auto=format",
          "https://images.unsplash.com/photo-1597106880198-28113da48a60?q=80&w=600&auto=format"
        ],
        environmentalData: {
          temperature: 29.8,
          humidity: 78,
          airQuality: 42,
          waterQuality: 63
        },
        impactAssessment: {
          immediate: "Loss of marine habitat and biodiversity",
          longTerm: "Ecosystem collapse and impact on fisheries",
          radius: 350
        },
        recommendedActions: [
          "Deploy temperature monitoring buoys",
          "Identify and protect resilient coral species",
          "Implement fishing restrictions in affected areas",
          "Develop coral nursery and replanting programs"
        ],
        relatedIssues: [
          {
            id: "OA002",
            title: "Ocean Acidification Spike"
          },
          {
            id: "MP008",
            title: "Marine Heatwave Pattern"
          }
        ],
        comments: [
          {
            user: "Prof. Robert Chen",
            text: "This aligns with our predictive models. We're seeing similar patterns in the Coral Triangle region.",
            timestamp: "2025-07-16 13:05 UTC"
          }
        ]
      }
    ],
    sdg15: [
      {
        id: "LI001",
        title: "Deforestation Rate Increase",
        description: "Satellite imagery shows a 32% increase in deforestation rates in the Amazon Basin compared to the previous year. Primary causes include illegal logging, agricultural expansion, and mining operations.",
        location: "Amazon Basin",
        coordinates: {
          lat: -3.4653,
          lng: -62.2159
        },
        date: "2025-07-10",
        time: "19:20 UTC",
        reporter: {
          name: "Dr. Carlos Mendes",
          role: "Forestry Expert",
          id: "CM4298"
        },
        category: "Forest Conservation",
        severity: "Critical" as const,
        status: "Action Needed" as const,
        aiConfidence: 92,
        tags: ["Deforestation", "Amazon", "Carbon", "Biodiversity"],
        images: [
          "https://images.unsplash.com/photo-1619608176024-79ab74bd9a93?q=80&w=600&auto=format",
          "https://images.unsplash.com/photo-1600152305576-c3a10a83f981?q=80&w=600&auto=format"
        ],
        environmentalData: {
          temperature: 31.2,
          humidity: 85,
          airQuality: 56,
          soilQuality: 78
        },
        impactAssessment: {
          immediate: "Habitat loss for indigenous species and disruption to local communities",
          longTerm: "Carbon sequestration reduction and climate impact",
          radius: 750
        },
        recommendedActions: [
          "Strengthen enforcement against illegal logging",
          "Implement satellite monitoring system",
          "Support indigenous land rights",
          "Develop sustainable agriculture alternatives"
        ],
        relatedIssues: [
          {
            id: "BD012",
            title: "Biodiversity Loss Hotspot"
          },
          {
            id: "IC007",
            title: "Indigenous Communities Displacement"
          }
        ],
        comments: [
          {
            user: "Dr. Maria Silva",
            text: "The rate of forest clearance has accelerated in the southern region. We need urgent intervention.",
            timestamp: "2025-07-11 08:34 UTC"
          },
          {
            user: "Prof. John Barnes",
            text: "This represents a significant carbon sink loss. Estimated impact of 45M tons of CO2 not sequestered annually.",
            timestamp: "2025-07-12 15:22 UTC"
          }
        ]
      }
    ]
  };

  // Redirect users to their correct dashboard based on role
  useEffect(() => {
    if (!loading && user && user.role !== 'researcher') {
      console.log(`Researcher dashboard: Redirecting ${user.role} user to their dashboard`);
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  // Show loading only while auth provider is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-teal-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If wrong role, redirect - Commented out to prevent automatic redirects
  // if (user.role !== 'researcher') {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
  //       <div className="text-center">
  //         <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-lg text-teal-700">Redirecting to appropriate dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-foreground">Research Hub</span>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search data, studies, or locations..." className="pl-10 glass border-border/30" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* SDG Tabs - Main Navigation */}
      <div className="glass border-b">
        <div className="px-6">
          <Tabs value={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="sdg13" className="text-sm">
                SDG 13: Climate
              </TabsTrigger>
              <TabsTrigger value="sdg14" className="text-sm">
                SDG 14: Ocean
              </TabsTrigger>
              <TabsTrigger value="sdg15" className="text-sm">
                SDG 15: Land
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="p-6 space-y-6">
        {/* Live Visualization Map */}
        <Card className="glass mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xl font-serif">Global Air Quality Index (AQI) Map</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[70vh] md:h-[500px] rounded-lg overflow-hidden relative border border-muted">
              <iframe 
                src="https://mahad2810.github.io/AQIMap/" 
                className="w-full h-full border-0 absolute inset-0" 
                title="Air Quality Index Map" 
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
              <div className="absolute top-2 right-2 bg-background/80 p-1.5 rounded-md shadow-sm flex items-center gap-1.5 text-xs backdrop-blur-sm">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>AQI Map</span>
              </div>
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button 
                  onClick={() => {
                    // Open the map in a new tab for fullscreen viewing
                    window.open("https://mahad2810.github.io/AQIMap/", "_blank");
                  }}
                  className="bg-background/80 p-1.5 rounded-md shadow-sm flex items-center gap-1 text-xs backdrop-blur-sm hover:bg-background/100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                  <span>Fullscreen</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between mt-5 gap-4">
              <div className="grid grid-cols-2 md:flex md:items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span>Hazardous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded-full" />
                  <span>Unhealthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                  <span>Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span>Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  <span>Monitoring Stations</span>
                </div>
              </div>
              <span className="text-sm font-medium bg-secondary/20 px-3 py-1 rounded-full">Live AQI data</span>
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-md">
              <p className="font-medium mb-2">About this map:</p>
              <p className="text-muted-foreground">This interactive AQI map shows real-time air quality data from monitoring stations worldwide. The map provides critical information for analyzing pollution patterns and their correlation with climate change indicators. Use the map controls to zoom, filter by pollutant type, or view historical data.</p>
              <div className="mt-3 text-sm flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-background/50">PM2.5</Badge>
                <Badge variant="outline" className="bg-background/50">PM10</Badge>
                <Badge variant="outline" className="bg-background/50">O3</Badge>
                <Badge variant="outline" className="bg-background/50">NO2</Badge>
                <Badge variant="outline" className="bg-background/50">SO2</Badge>
                <Badge variant="outline" className="bg-background/50">CO</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SDG Metrics & AI Issues - Tab Content */}
        <Tabs value={activeTab} className="w-full" id="content-tabs" onValueChange={(value) => setActiveTab(value)}>
          {/* SDG 13: Climate Action Content */}
          <TabsContent value="sdg13">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SDG 13 Metric Cards */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif font-semibold">SDG 13: Climate Action Metrics</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open('http://localhost:8504/', '_blank')}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Deep Analysis
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-5 h-5 text-red-500" />
                          <span className="font-medium">Global Temperature</span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-red-600 mb-1">+1.2°C</div>
                      <div className="text-sm text-muted-foreground">Above pre-industrial levels</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Line 
                          data={{
                            labels: ['1900', '1920', '1940', '1960', '1980', '2000', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Temperature Anomaly (°C)',
                                data: [-0.16, -0.25, 0.12, 0.03, 0.27, 0.61, 0.98, 1.2],
                                borderColor: 'rgb(239, 68, 68)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                tension: 0.3,
                                fill: true
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">CO₂ Emissions</span>
                        </div>
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">410 ppm</div>
                      <div className="text-sm text-muted-foreground">Atmospheric concentration</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Bar
                          data={{
                            labels: ['1970', '1980', '1990', '2000', '2010', '2020', '2025'],
                            datasets: [
                              {
                                label: 'CO₂ (ppm)',
                                data: [325, 337, 354, 369, 389, 412, 410],
                                backgroundColor: 'rgb(249, 115, 22)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Waves className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Extreme Weather Events</span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">+27%</div>
                      <div className="text-sm text-muted-foreground">Increase over 30 years</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Line 
                          data={{
                            labels: ['1995', '2000', '2005', '2010', '2015', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Events per year',
                                data: [178, 204, 249, 281, 305, 337, 352],
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.2,
                                fill: true
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Carbon Sequestration</span>
                        </div>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">-12%</div>
                      <div className="text-sm text-muted-foreground">Forest carbon capture capacity</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "31%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Doughnut 
                          data={{
                            labels: ['Remaining Capacity', 'Lost Capacity'],
                            datasets: [
                              {
                                data: [88, 12],
                                backgroundColor: [
                                  'rgb(34, 197, 94)',
                                  'rgba(239, 68, 68, 0.7)',
                                ],
                                borderWidth: 0
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false }
                            },
                            cutout: '75%'
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI-Approved Issues for SDG 13 */}
              <div>
                <h3 className="text-lg font-serif font-semibold mb-4">AI-Approved Climate Issues</h3>
                <Card className="glass">
                  <CardContent className="p-4 space-y-4">
                    {reportedIssues.sdg13.map((issue, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsIssueModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground text-sm">{issue.title}</h4>
                          <Badge variant={issue.severity === "Critical" ? "destructive" : "secondary"} className="text-xs">
                            {issue.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{issue.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {issue.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {issue.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{issue.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-teal-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>{issue.aiConfidence}% AI</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 text-xs font-normal justify-center items-center flex gap-1 h-7 text-muted-foreground"
                        >
                          <Info className="w-3 h-3" />
                          View Details
                        </Button>
                      </div>
                    ))}
                    
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Carbon Budget Exceedance</h4>
                        <Badge variant="secondary" className="text-xs">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Global</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Emissions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Policy
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>89% AI</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Permafrost Thawing</h4>
                        <Badge variant="secondary" className="text-xs">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Siberia</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Methane
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Feedback
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>94% AI</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SDG 14: Life Below Water Content */}
          <TabsContent value="sdg14">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SDG 14 Metric Cards */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif font-semibold">SDG 14: Life Below Water Metrics</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open('http://localhost:8502/', '_blank')}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Deep Analysis
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Waves className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Ocean Acidification</span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">pH 8.05</div>
                      <div className="text-sm text-muted-foreground">Decreased from pH 8.11</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Line 
                          data={{
                            labels: ['1990', '1995', '2000', '2005', '2010', '2015', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Ocean pH Level',
                                data: [8.11, 8.10, 8.09, 8.08, 8.07, 8.06, 8.055, 8.05],
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4,
                                fill: true
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false },
                                min: 8.0,
                                max: 8.15
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">Marine Pollution</span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">+43%</div>
                      <div className="text-sm text-muted-foreground">Plastic waste increase since 2000</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Bar
                          data={{
                            labels: ['2000', '2005', '2010', '2015', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Million metric tons',
                                data: [100, 120, 156, 178, 205, 242],
                                backgroundColor: 'rgb(249, 115, 22)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Waves className="w-5 h-5 text-cyan-500" />
                          <span className="font-medium">Coral Reef Health</span>
                        </div>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-cyan-600 mb-1">-14%</div>
                      <div className="text-sm text-muted-foreground">Decline in global coverage</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Line 
                          data={{
                            labels: ['2000', '2005', '2010', '2015', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Health Index',
                                data: [92, 88, 83, 79, 74, 70],
                                borderColor: 'rgb(6, 182, 212)',
                                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                tension: 0.3,
                                fill: true
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false },
                                min: 65,
                                max: 95
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Waves className="w-5 h-5 text-emerald-500" />
                          <span className="font-medium">Marine Protected Areas</span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 mb-1">7.91%</div>
                      <div className="text-sm text-muted-foreground">Of global ocean area</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "28%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Radar
                          data={{
                            labels: ['Coverage', 'Enforcement', 'Biodiversity', 'Resilience', 'Community Support'],
                            datasets: [
                              {
                                label: 'Current',
                                data: [7.91, 5.2, 6.7, 4.8, 7.2],
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                borderColor: 'rgb(16, 185, 129)',
                                pointBackgroundColor: 'rgb(16, 185, 129)',
                              },
                              {
                                label: 'Target',
                                data: [10, 8, 8, 7, 9],
                                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                pointBackgroundColor: 'rgba(59, 130, 246, 0.8)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              r: {
                                beginAtZero: true,
                                ticks: { display: false, maxTicksLimit: 5 },
                                pointLabels: { display: false },
                                grid: { circular: true, display: true, color: 'rgba(0, 0, 0, 0.05)' },
                                angleLines: { display: false },
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            },
                            elements: {
                              line: { borderWidth: 2 }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI-Approved Issues for SDG 14 */}
              <div>
                <h3 className="text-lg font-serif font-semibold mb-4">AI-Approved Ocean Issues</h3>
                <Card className="glass">
                  <CardContent className="p-4 space-y-4">
                    {reportedIssues.sdg14.map((issue, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsIssueModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground text-sm">{issue.title}</h4>
                          <Badge variant={issue.severity === "Critical" ? "destructive" : "secondary"} className="text-xs">
                            {issue.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{issue.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {issue.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {issue.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{issue.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-teal-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>{issue.aiConfidence}% AI</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 text-xs font-normal justify-center items-center flex gap-1 h-7 text-muted-foreground"
                        >
                          <Info className="w-3 h-3" />
                          View Details
                        </Button>
                      </div>
                    ))}
                    
                    {/* Additional static issues */}
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Overfishing in Protected Zone</h4>
                        <Badge variant="secondary" className="text-xs">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>South China Sea</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Fisheries
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Compliance
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>91% AI</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Microplastic Concentration</h4>
                        <Badge variant="secondary" className="text-xs">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Mediterranean Sea</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Pollution
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Food Chain
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>93% AI</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Ocean Dead Zone Expansion</h4>
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Gulf of Mexico</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Oxygen
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Runoff
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>89% AI</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SDG 15: Life on Land Content */}
          <TabsContent value="sdg15">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SDG 15 Metric Cards */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif font-semibold">SDG 15: Life on Land Metrics</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open('http://localhost:8503/', '_blank')}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Deep Analysis
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Forest Cover</span>
                        </div>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">31%</div>
                      <div className="text-sm text-muted-foreground">Global land coverage</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "31%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Bar
                          data={{
                            labels: ['1990', '2000', '2010', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Forest Cover (%)',
                                data: [37.4, 35.2, 33.1, 31.8, 31],
                                backgroundColor: [
                                  'rgba(34, 197, 94, 0.8)',
                                  'rgba(34, 197, 94, 0.7)',
                                  'rgba(34, 197, 94, 0.6)',
                                  'rgba(34, 197, 94, 0.5)',
                                  'rgba(34, 197, 94, 0.4)'
                                ],
                                borderWidth: 0
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            scales: {
                              x: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false },
                                min: 25,
                                max: 40
                              },
                              y: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-rose-500" />
                          <span className="font-medium">Deforestation Rate</span>
                        </div>
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-rose-600 mb-1">4.7M ha/yr</div>
                      <div className="text-sm text-muted-foreground">Annual forest loss</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-rose-500 h-2 rounded-full" style={{ width: "55%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Line 
                          data={{
                            labels: ['2000', '2005', '2010', '2015', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Million hectares/year',
                                data: [7.8, 7.3, 6.5, 5.4, 5.0, 4.7],
                                borderColor: 'rgb(225, 29, 72)',
                                backgroundColor: 'rgba(225, 29, 72, 0.1)',
                                tension: 0.3,
                                fill: true
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false },
                                min: 4,
                                max: 8
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-amber-500" />
                          <span className="font-medium">Biodiversity Loss</span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-amber-600 mb-1">-68%</div>
                      <div className="text-sm text-muted-foreground">Vertebrate population decline</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Line 
                          data={{
                            labels: ['1970', '1980', '1990', '2000', '2010', '2020', '2025'],
                            datasets: [
                              {
                                label: 'Living Planet Index',
                                data: [1, 0.86, 0.73, 0.58, 0.45, 0.34, 0.32],
                                borderColor: 'rgb(217, 119, 6)',
                                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                                tension: 0.3,
                                fill: true,
                                borderWidth: 2
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: false,
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false },
                                reverse: false,
                                min: 0,
                                max: 1
                              },
                              x: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-emerald-500" />
                          <span className="font-medium">Protected Land Areas</span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 mb-1">16.64%</div>
                      <div className="text-sm text-muted-foreground">Of global terrestrial area</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                      </div>
                      <div className="h-24 mt-4">
                        <Doughnut 
                          data={{
                            labels: ['Protected', 'Unprotected'],
                            datasets: [
                              {
                                data: [16.64, 83.36],
                                backgroundColor: [
                                  'rgb(16, 185, 129)',
                                  'rgba(203, 213, 225, 0.5)',
                                ],
                                borderWidth: 0
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false }
                            },
                            cutout: '70%'
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI-Approved Issues for SDG 15 */}
              <div>
                <h3 className="text-lg font-serif font-semibold mb-4">AI-Approved Land Issues</h3>
                <Card className="glass">
                  <CardContent className="p-4 space-y-4">
                    {reportedIssues.sdg15.map((issue, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsIssueModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground text-sm">{issue.title}</h4>
                          <Badge variant={issue.severity === "Critical" ? "destructive" : "secondary"} className="text-xs">
                            {issue.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{issue.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {issue.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {issue.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{issue.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-teal-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>{issue.aiConfidence}% AI</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 text-xs font-normal justify-center items-center flex gap-1 h-7 text-muted-foreground"
                        >
                          <Info className="w-3 h-3" />
                          View Details
                        </Button>
                      </div>
                    ))}
                    
                    {/* Additional static issues */}
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Grassland Desertification</h4>
                        <Badge variant="secondary" className="text-xs">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Northern Mongolia</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Land
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Erosion
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>87% AI</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Habitat Fragmentation</h4>
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Borneo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Biodiversity
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Wildlife
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>94% AI</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">Soil Degradation</h4>
                        <Badge variant="secondary" className="text-xs">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Sub-Saharan Africa</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            Agriculture
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Fertility
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>90% AI</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Project Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-600" />
              Create New Research Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Project Title</label>
                  <Input 
                    placeholder="Enter project title..." 
                    className="glass border-border/30"
                    value={projectFormData.title}
                    onChange={(e) => handleFormDataChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">SDG Focus</label>
                  <Select value={projectFormData.sdgFocus} onValueChange={(value) => handleFormDataChange('sdgFocus', value)}>
                    <SelectTrigger className="glass border-border/30">
                      <SelectValue placeholder="Select SDG category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sdg13">SDG 13: Climate Action</SelectItem>
                      <SelectItem value="sdg14">SDG 14: Life Below Water</SelectItem>
                      <SelectItem value="sdg15">SDG 15: Life on Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                  <Input 
                    placeholder="Geographic focus area..." 
                    className="glass border-border/30"
                    value={projectFormData.location}
                    onChange={(e) => handleFormDataChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Funding Requested ($)</label>
                  <Input 
                    type="number" 
                    placeholder="25000" 
                    className="glass border-border/30"
                    value={projectFormData.fundingRequested}
                    onChange={(e) => handleFormDataChange('fundingRequested', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Project Description</label>
                  <Textarea
                    placeholder="Describe your research objectives and methodology..."
                    className="glass border-border/30 min-h-[100px]"
                    value={projectFormData.description}
                    onChange={(e) => handleFormDataChange('description', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Expected Duration</label>
                    <Select value={projectFormData.duration} onValueChange={(value) => handleFormDataChange('duration', value)}>
                      <SelectTrigger className="glass border-border/30">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 months</SelectItem>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="2years">2+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">My Commission (%)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="20" 
                      placeholder="5" 
                      className="glass border-border/30"
                      value={projectFormData.commission}
                      onChange={(e) => handleFormDataChange('commission', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Standard range: 2-15%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selected NGO Display */}
            {selectedNGO && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/30">
                <h4 className="text-sm font-medium mb-2">Selected NGO Partner</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {selectedNGO.logo}
                    </div>
                    <div>
                      <div className="font-medium">{selectedNGO.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedNGO.location}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsNGOModalOpen(true)}
                  >
                    Change NGO
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" className="bg-transparent">
                Save Draft
              </Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                onClick={handleFormSubmit}
              >
                {selectedNGO ? 'Submit Project Proposal' : 'Continue to NGO Selection'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Impact Charts: Projected vs Actual */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                      <span className="text-sm font-medium">Overall Project Success</span>
                    </div>
                    <Badge variant="outline" className="text-teal-600 border-teal-600/30">
                      83% Complete
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-400 h-4 rounded-full" style={{ width: "83%" }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/40 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-teal-600">42</div>
                    <div className="text-xs text-center text-muted-foreground mt-1">Research Papers</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/40 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-emerald-600">17</div>
                    <div className="text-xs text-center text-muted-foreground mt-1">NGO Partnerships</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/40 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-cyan-600">5.2M</div>
                    <div className="text-xs text-center text-muted-foreground mt-1">People Impacted</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/40 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-purple-600">$8.3M</div>
                    <div className="text-xs text-center text-muted-foreground mt-1">Funding Secured</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground text-center pt-2">
                  <span className="font-medium text-foreground">Last updated:</span> August 19, 2025
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass lg:col-span-2">
            <CardHeader className="border-b border-border/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  Environmental Impact Metrics
                </CardTitle>
                <Select defaultValue="2025">
                  <SelectTrigger className="w-[100px] h-8 text-xs border-border/30 bg-background/50">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Carbon Reduction (tons)</h4>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">2,500</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Actual</span>
                      <div className="flex items-center">
                        <span className="font-medium">1,875</span>
                        <Badge variant="outline" className="ml-2 h-5 text-[10px]">75%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <TrendingUp className="w-3 h-3 mr-1 text-teal-600" />
                      <span>Up 12% from last quarter</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium mb-4 mt-6">Biodiversity Protection (species)</h4>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Actual</span>
                      <div className="flex items-center">
                        <span className="font-medium">38</span>
                        <Badge variant="outline" className="ml-2 h-5 text-[10px]">84%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "84%" }}></div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
                      <span>Up 5% from last quarter</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-4">Ocean Area Protected (km²)</h4>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">1,200</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Actual</span>
                      <div className="flex items-center">
                        <span className="font-medium">1,080</span>
                        <Badge variant="outline" className="ml-2 h-5 text-[10px]">90%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <TrendingUp className="w-3 h-3 mr-1 text-cyan-600" />
                      <span>Up 8% from last quarter</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium mb-4 mt-6">Deforestation Prevented (hectares)</h4>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">850</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Actual</span>
                      <div className="flex items-center">
                        <span className="font-medium">722</span>
                        <Badge variant="outline" className="ml-2 h-5 text-[10px]">85%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <TrendingUp className="w-3 h-3 mr-1 text-amber-600" />
                      <span>Up 15% from last quarter</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Reported Issue Modal */}
      <ReportedIssueModal 
        issue={selectedIssue}
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
      />
      
      {/* NGO Selection Modal */}
      <NGOSelectionModal
        isOpen={isNGOModalOpen}
        onClose={() => setIsNGOModalOpen(false)}
        onSelectNGO={handleNGOSelection}
        projectLocation={projectFormData.location}
      />

      {/* Floating Chatbot Button */}
      <Button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700 z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Floating Chatbot Modal */}
      {isChatbotOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsChatbotOpen(false);
            }
          }}
        >
          <div className="bg-background border rounded-lg shadow-lg sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0 w-[90vw]">
            {/* Chatbot Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold">EcoSphere AI Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatbotOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Chatbot Content */}
            <div className="flex-1 p-0">
              <iframe
                src="http://localhost:8501"
                className="w-full h-full min-h-[70vh]"
                frameBorder="0"
                allow="microphone; camera"
                title="EcoSphere AI Chatbot"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
