"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

      {/* SDG Tabs */}
      <div className="glass border-b">
        <div className="px-6">
          <Tabs defaultValue="sdg13" className="w-full">
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
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif">Global Environmental Data Visualization</CardTitle>
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
            <div className="w-full h-80 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10" />
              <div className="text-center z-10">
                <MapPin className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Interactive Environmental Map</h3>
                <p className="text-muted-foreground">
                  Real-time data visualization with climate, ocean, and land metrics
                </p>
              </div>
              {/* Simulated data points */}
              <div className="absolute top-20 left-20 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute top-32 right-32 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <div className="absolute bottom-24 left-1/3 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute bottom-32 right-20 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span>Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>Improving</span>
                </div>
              </div>
              <span>Last updated: 2 minutes ago</span>
            </div>
          </CardContent>
        </Card>

        {/* SDG Metrics & AI Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SDG Metric Cards */}
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
                      <span className="font-medium">Sea Level Rise</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">3.4 mm/yr</div>
                  <div className="text-sm text-muted-foreground">Current rate of increase</div>
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
            </div>
          </div>

          {/* AI-Approved Issues */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4">AI-Approved Environmental Issues</h3>
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
                    title: "Coral Bleaching Event",
                    location: "Great Barrier Reef",
                    severity: "High",
                    tags: ["Marine", "Biodiversity"],
                    confidence: 88,
                  },
                  {
                    title: "Deforestation Rate Increase",
                    location: "Amazon Basin",
                    severity: "High",
                    tags: ["Forest", "Carbon"],
                    confidence: 92,
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
