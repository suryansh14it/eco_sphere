"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"

export default function ResearcherDashboard() {
  const [activeTab, setActiveTab] = useState("sdg13");
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'researcher') {
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show loading
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-teal-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If wrong role, redirect
  if (user.role !== 'researcher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-teal-700">Redirecting to appropriate dashboard...</p>
        </div>
      </div>
    );
  }

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
                <h3 className="text-lg font-serif font-semibold mb-4">SDG 13: Climate Action Metrics</h3>
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
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI-Approved Issues for SDG 13 */}
              <div>
                <h3 className="text-lg font-serif font-semibold mb-4">AI-Approved Climate Issues</h3>
                <Card className="glass">
                  <CardContent className="p-4 space-y-4">
                    {[
                      {
                        title: "Arctic Ice Melting Acceleration",
                        location: "Greenland",
                        severity: "Critical",
                        tags: ["Climate", "Ice Loss"],
                        confidence: 95,
                      },
                      {
                        title: "Drought Intensification",
                        location: "East Africa",
                        severity: "Critical",
                        tags: ["Climate", "Water"],
                        confidence: 92,
                      },
                      {
                        title: "Carbon Budget Exceedance",
                        location: "Global",
                        severity: "High",
                        tags: ["Emissions", "Policy"],
                        confidence: 89,
                      },
                      {
                        title: "Permafrost Thawing",
                        location: "Siberia",
                        severity: "High",
                        tags: ["Methane", "Feedback"],
                        confidence: 94,
                      },
                    ].map((issue, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
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
                            {issue.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-teal-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>{issue.confidence}% AI</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                <h3 className="text-lg font-serif font-semibold mb-4">SDG 14: Life Below Water Metrics</h3>
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
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI-Approved Issues for SDG 14 */}
              <div>
                <h3 className="text-lg font-serif font-semibold mb-4">AI-Approved Ocean Issues</h3>
                <Card className="glass">
                  <CardContent className="p-4 space-y-4">
                    {[
                      {
                        title: "Coral Bleaching Event",
                        location: "Great Barrier Reef",
                        severity: "Critical",
                        tags: ["Marine", "Biodiversity"],
                        confidence: 88,
                      },
                      {
                        title: "Overfishing in Protected Zone",
                        location: "South China Sea",
                        severity: "High",
                        tags: ["Fisheries", "Compliance"],
                        confidence: 91,
                      },
                      {
                        title: "Microplastic Concentration",
                        location: "Mediterranean Sea",
                        severity: "High", 
                        tags: ["Pollution", "Food Chain"],
                        confidence: 93,
                      },
                      {
                        title: "Ocean Dead Zone Expansion",
                        location: "Gulf of Mexico",
                        severity: "Critical",
                        tags: ["Oxygen", "Runoff"],
                        confidence: 89,
                      },
                    ].map((issue, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
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
                            {issue.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-teal-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>{issue.confidence}% AI</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                <h3 className="text-lg font-serif font-semibold mb-4">SDG 15: Life on Land Metrics</h3>
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
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI-Approved Issues for SDG 15 */}
              <div>
                <h3 className="text-lg font-serif font-semibold mb-4">AI-Approved Land Issues</h3>
                <Card className="glass">
                  <CardContent className="p-4 space-y-4">
                    {[
                      {
                        title: "Deforestation Rate Increase",
                        location: "Amazon Basin",
                        severity: "Critical",
                        tags: ["Forest", "Carbon"],
                        confidence: 92,
                      },
                      {
                        title: "Grassland Desertification",
                        location: "Northern Mongolia",
                        severity: "High",
                        tags: ["Land", "Erosion"],
                        confidence: 87,
                      },
                      {
                        title: "Habitat Fragmentation",
                        location: "Borneo",
                        severity: "Critical", 
                        tags: ["Biodiversity", "Wildlife"],
                        confidence: 94,
                      },
                      {
                        title: "Soil Degradation",
                        location: "Sub-Saharan Africa",
                        severity: "High",
                        tags: ["Agriculture", "Fertility"],
                        confidence: 90,
                      },
                    ].map((issue, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
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
                            {issue.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-teal-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>{issue.confidence}% AI</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <Input placeholder="Enter project title..." className="glass border-border/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">SDG Focus</label>
                  <Select>
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
                  <Input placeholder="Geographic focus area..." className="glass border-border/30" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Project Description</label>
                  <Textarea
                    placeholder="Describe your research objectives and methodology..."
                    className="glass border-border/30 min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Expected Duration</label>
                  <Select>
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
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" className="bg-transparent">
                Save Draft
              </Button>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Submit for Review
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Impact Charts: Projected vs Actual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Projected Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Carbon Reduction Target</span>
                  <span className="font-medium text-teal-600">2,500 tons</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-teal-500 h-3 rounded-full" style={{ width: "100%" }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Biodiversity Protection</span>
                  <span className="font-medium text-emerald-600">45 species</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: "100%" }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ocean Area Protected</span>
                  <span className="font-medium text-cyan-600">1,200 km²</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-cyan-500 h-3 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Actual Impact Achieved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Carbon Reduction Actual</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-teal-600">1,875 tons</span>
                    <Badge variant="secondary" className="text-xs">
                      75%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-teal-500 h-3 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Biodiversity Protection</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-emerald-600">38 species</span>
                    <Badge variant="secondary" className="text-xs">
                      84%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: "84%" }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ocean Area Protected</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-cyan-600">1,080 km²</span>
                    <Badge variant="secondary" className="text-xs">
                      90%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-cyan-500 h-3 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
