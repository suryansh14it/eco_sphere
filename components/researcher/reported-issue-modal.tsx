"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line } from "react-chartjs-2";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  FileText,
  MessageSquare,
  Camera,
  Download,
  BarChart3,
  Waves,
  TreePine
} from "lucide-react";

export type ReportedIssueData = {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  reporter: {
    name: string;
    role: string;
    id: string;
  };
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "Under Review" | "Verified" | "Action Needed" | "Resolved";
  aiConfidence: number;
  tags: string[];
  images: string[];
  environmentalData: {
    temperature: number;
    humidity: number;
    airQuality: number;
    waterQuality?: number;
    soilQuality?: number;
  };
  impactAssessment: {
    immediate: string;
    longTerm: string;
    radius: number;
  };
  recommendedActions: string[];
  relatedIssues: {
    id: string;
    title: string;
  }[];
  comments: {
    user: string;
    text: string;
    timestamp: string;
  }[];
};

interface ReportedIssueModalProps {
  issue: ReportedIssueData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportedIssueModal({ issue, isOpen, onClose }: ReportedIssueModalProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!issue) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-amber-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-slate-200 text-slate-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      case "Verified":
        return "bg-emerald-100 text-emerald-800";
      case "Action Needed":
        return "bg-amber-100 text-amber-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0 w-[90vw]">
        <DialogHeader className="border-b border-border/30 pb-4 px-8 pt-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-background/50 text-muted-foreground border-border/30">ID: {issue.id}</Badge>
                <Badge variant="outline" className="bg-background/50 text-muted-foreground border-border/30">{issue.category}</Badge>
              </div>
              <DialogTitle className="text-2xl font-serif">{issue.title}</DialogTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
                <Badge className={getSeverityColor(issue.severity)}>
                  {issue.severity} Severity
                </Badge>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>Reported on {issue.date}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span>{issue.time}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
                  <MapPin className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <div className="font-medium">{issue.location}</div>
                  <div className="text-xs text-muted-foreground">
                    Coordinates: {issue.coordinates.lat.toFixed(4)}, {issue.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">{issue.reporter.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {issue.reporter.role} (ID: {issue.reporter.id})
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium">AI Confidence</div>
                  <div className="text-xs">
                    <span className={issue.aiConfidence > 90 ? "text-emerald-600" : issue.aiConfidence > 70 ? "text-amber-600" : "text-red-600"}>
                      {issue.aiConfidence}% {issue.aiConfidence > 90 ? "High" : issue.aiConfidence > 70 ? "Medium" : "Low"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {issue.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-muted/50">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid grid-cols-4 mb-8 bg-muted/50 p-1.5 w-full max-w-2xl mx-auto">
            <TabsTrigger value="details" className="flex items-center gap-2 text-sm py-3">
              <FileText className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2 text-sm py-3">
              <BarChart3 className="w-4 h-4" />
              Environmental Data
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2 text-sm py-3">
              <Camera className="w-4 h-4" />
              Evidence ({issue.images.length})
            </TabsTrigger>
            <TabsTrigger value="discussion" className="flex items-center gap-2 text-sm py-3">
              <MessageSquare className="w-4 h-4" />
              Discussion ({issue.comments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <Card className="xl:col-span-3">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 text-lg">Description</h4>
                    <p className="text-muted-foreground">{issue.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 text-lg">Impact Assessment</h4>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                      <div>
                        <span className="font-medium">Immediate Impact:</span>
                        <p className="text-muted-foreground mt-1">{issue.impactAssessment.immediate}</p>
                      </div>
                      <div>
                        <span className="font-medium">Long-term Impact:</span>
                        <p className="text-muted-foreground mt-1">{issue.impactAssessment.longTerm}</p>
                      </div>
                      <div>
                        <span className="font-medium">Impact Radius:</span>
                        <p className="text-muted-foreground mt-1">{issue.impactAssessment.radius} km</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-lg">Recommended Actions</h4>
                    <ul className="space-y-2 bg-muted/30 p-4 rounded-lg">
                      {issue.recommendedActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h4 className="font-medium mb-3 text-lg">Issue Information</h4>
                    <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <span>Reported: {issue.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" />
                        <span>Time: {issue.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-600" />
                        <span>Reporter: {issue.reporter.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-teal-600" />
                        <span>Category: {issue.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-teal-600" />
                        <span>AI Confidence: {issue.aiConfidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-lg">Tags</h4>
                    <div className="flex flex-wrap gap-2 bg-muted/30 p-4 rounded-lg">
                      {issue.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-lg">Related Issues</h4>
                    <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                      {issue.relatedIssues.map((related) => (
                        <div key={related.id} className="flex items-center justify-between p-3 bg-background/80 rounded-md hover:bg-background transition-colors">
                          <span className="font-medium">{related.title}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-medium mb-5 text-lg">Environmental Readings</h4>
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">Temperature</span>
                        </div>
                        <span className="text-xl font-semibold">{issue.environmentalData.temperature}°C</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 mt-2">
                        <div 
                          className="bg-orange-500 h-3 rounded-full" 
                          style={{ width: `${Math.min(100, (issue.environmentalData.temperature / 50) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0°C</span>
                        <span>50°C</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Waves className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Humidity</span>
                        </div>
                        <span className="text-xl font-semibold">{issue.environmentalData.humidity}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 mt-2">
                        <div 
                          className="bg-blue-500 h-3 rounded-full" 
                          style={{ width: `${issue.environmentalData.humidity}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <span className="font-medium">Air Quality Index</span>
                        </div>
                        <Badge variant={
                          issue.environmentalData.airQuality <= 50 ? "outline" :
                          issue.environmentalData.airQuality <= 100 ? "secondary" :
                          issue.environmentalData.airQuality <= 150 ? "default" : "destructive"
                        }>
                          {issue.environmentalData.airQuality} AQI
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 mt-2">
                        <div 
                          className={`h-3 rounded-full ${
                            issue.environmentalData.airQuality <= 50 
                              ? "bg-green-500" 
                              : issue.environmentalData.airQuality <= 100 
                              ? "bg-yellow-500" 
                              : issue.environmentalData.airQuality <= 150 
                              ? "bg-orange-500" 
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, (issue.environmentalData.airQuality / 300) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span className="text-green-600">Good</span>
                        <span className="text-yellow-600">Moderate</span>
                        <span className="text-orange-600">Unhealthy</span>
                        <span className="text-red-600">Hazardous</span>
                      </div>
                    </div>
                    
                    {issue.environmentalData.waterQuality && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Waves className="w-5 h-5 text-cyan-500" />
                            <span className="font-medium">Water Quality Index</span>
                          </div>
                          <span className="text-xl font-semibold">{issue.environmentalData.waterQuality}/100</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 mt-2">
                          <div 
                            className={`h-3 rounded-full ${
                              issue.environmentalData.waterQuality >= 80 
                                ? "bg-green-500" 
                                : issue.environmentalData.waterQuality >= 60 
                                ? "bg-yellow-500" 
                                : issue.environmentalData.waterQuality >= 40 
                                ? "bg-orange-500" 
                                : "bg-red-500"
                            }`}
                            style={{ width: `${issue.environmentalData.waterQuality}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span className="text-red-600">Poor</span>
                          <span className="text-orange-600">Fair</span>
                          <span className="text-yellow-600">Good</span>
                          <span className="text-green-600">Excellent</span>
                        </div>
                      </div>
                    )}
                    
                    {issue.environmentalData.soilQuality && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <TreePine className="w-5 h-5 text-emerald-500" />
                            <span className="font-medium">Soil Quality</span>
                          </div>
                          <span className="text-xl font-semibold">{issue.environmentalData.soilQuality}/100</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 mt-2">
                          <div 
                            className={`h-3 rounded-full ${
                              issue.environmentalData.soilQuality >= 80 
                                ? "bg-green-500" 
                                : issue.environmentalData.soilQuality >= 60 
                                ? "bg-yellow-500" 
                                : issue.environmentalData.soilQuality >= 40 
                                ? "bg-orange-500" 
                                : "bg-red-500"
                            }`}
                            style={{ width: `${issue.environmentalData.soilQuality}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span className="text-red-600">Poor</span>
                          <span className="text-orange-600">Fair</span>
                          <span className="text-yellow-600">Good</span>
                          <span className="text-green-600">Excellent</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-medium text-lg">Historical Data</h4>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="temperature">
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="temperature">Temperature</SelectItem>
                          <SelectItem value="humidity">Humidity</SelectItem>
                          <SelectItem value="airquality">Air Quality</SelectItem>
                          {issue.environmentalData.waterQuality && (
                            <SelectItem value="waterquality">Water Quality</SelectItem>
                          )}
                          {issue.environmentalData.soilQuality && (
                            <SelectItem value="soilquality">Soil Quality</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" /> Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="text-center font-medium mb-4">
                      Temperature data from this location (past 6 months)
                    </div>
                    <div className="h-80 w-full">
                      <Line
                        data={{
                          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                          datasets: [
                            {
                              label: 'Temperature (°C)',
                              data: [
                                issue.environmentalData.temperature - 2.3,
                                issue.environmentalData.temperature - 1.8,
                                issue.environmentalData.temperature - 0.5,
                                issue.environmentalData.temperature - 0.2,
                                issue.environmentalData.temperature - 0.4,
                                issue.environmentalData.temperature - 0.1,
                                issue.environmentalData.temperature,
                              ],
                              borderColor: 'rgb(239, 68, 68)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              tension: 0.3,
                              fill: true
                            },
                            {
                              label: 'Average Historical',
                              data: [
                                issue.environmentalData.temperature - 4.5,
                                issue.environmentalData.temperature - 4.2,
                                issue.environmentalData.temperature - 3.7,
                                issue.environmentalData.temperature - 3.2,
                                issue.environmentalData.temperature - 3.0,
                                issue.environmentalData.temperature - 2.8,
                                issue.environmentalData.temperature - 2.7,
                              ],
                              borderColor: 'rgba(59, 130, 246, 0.8)',
                              borderDash: [5, 5],
                              backgroundColor: 'transparent',
                              tension: 0.3,
                              fill: false
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: false,
                              grid: { display: true, color: 'rgba(0,0,0,0.05)' },
                              ticks: { color: 'rgba(0,0,0,0.6)' },
                              title: {
                                display: true,
                                text: 'Temperature (°C)'
                              }
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: 'rgba(0,0,0,0.6)' }
                            }
                          },
                          plugins: {
                            legend: { display: true, position: 'top' },
                            tooltip: { mode: 'index', intersect: false }
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <div className="text-xs text-muted-foreground">
                        Source: Global Environmental Monitoring System
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">View Full Analysis</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="p-4 mb-4 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Evidence Images</h3>
              <p className="text-muted-foreground">These images were submitted as evidence of the reported environmental issue.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issue.images.length > 0 ? (
                issue.images.map((image, index) => (
                  <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-square relative">
                      <img 
                        src={image} 
                        alt={`Evidence ${index + 1}`} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Evidence {index + 1}</div>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M15 3h6v6"></path>
                            <path d="M10 14 21 3"></path>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          </svg>
                          <span className="text-xs">Full Size</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-muted/30 rounded-lg">
                  <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                  <h4 className="text-xl font-medium">No Images Available</h4>
                  <p className="text-muted-foreground mt-2">No images have been attached to this reported issue.</p>
                  <Button variant="outline" className="mt-4">Request Images</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="discussion">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="p-4 mb-4 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Research Discussion</h3>
                  <p className="text-muted-foreground">Collaborate with other researchers on this environmental issue.</p>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    {issue.comments.length > 0 ? (
                      <div className="space-y-4">
                        {issue.comments.map((comment, index) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{comment.user}</div>
                                  <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
                                </div>
                                <div className="text-xs text-muted-foreground">Research Collaborator</div>
                              </div>
                            </div>
                            <p>{comment.text}</p>
                            <div className="flex items-center justify-end gap-2 mt-3">
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                                Reference
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <MessageSquare className="w-14 h-14 text-muted-foreground mb-3" />
                        <h4 className="text-xl font-medium">No Discussion Yet</h4>
                        <p className="text-muted-foreground mt-2">Be the first to comment on this issue.</p>
                        <Button className="mt-4">Start Discussion</Button>
                      </div>
                    )}
                    
                    {issue.comments.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Add Your Insights</h4>
                          <Textarea className="min-h-[100px]" placeholder="Share your research findings or ask questions..." />
                          <div className="flex justify-end mt-2">
                            <Button>Post Comment</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <div className="p-4 mb-4 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Issue Timeline</h3>
                  <p className="text-muted-foreground">History of research activity.</p>
                </div>
                
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Issue Reported</div>
                        <div className="text-xs text-muted-foreground">{issue.date}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">AI Analysis Completed</div>
                        <div className="text-xs text-muted-foreground">{issue.date}</div>
                      </div>
                    </div>
                    
                    {issue.comments.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                          <MessageSquare className="w-3 h-3 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">First Research Comment</div>
                          <div className="text-xs text-muted-foreground">{issue.comments[0].timestamp}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                        <Clock className="w-3 h-3 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Status Updated</div>
                        <div className="text-xs text-muted-foreground">Today</div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full text-xs">View Complete Timeline</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-2 mt-6 border-t border-border/30 pt-4 px-8 pb-6 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-1">
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </Button>
            <Button variant="outline" className="gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Share</span>
            </Button>
          </div>
          <Button variant="default" size="lg" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
