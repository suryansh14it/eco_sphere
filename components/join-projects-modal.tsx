"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Calendar, 
  MapPin, 
  Leaf, 
  Clock, 
  Shield, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  UserPlus
} from "lucide-react"

interface ProjectDetailedInfo {
  id: string
  title: string
  organization: string
  location: string
  startDate: string
  endDate: string
  participants: number
  maxParticipants: number
  progress: number
  status: "active" | "completed" | "upcoming"
  impact: string
  xp: string
  description: string
  environmentalImpact: {
    type: string
    metrics: {
      treesPlanted?: number
      co2Reduction?: number
      wasteRecycled?: number
      areaRestored?: number
      speciesProtected?: number
    }
  }
  goals: string[]
  requirements: string[]
  updates: {
    date: string
    content: string
  }[]
  gallery?: string[]
  coordinator: {
    name: string
    contact: string
  }
  funding?: {
    source: string
    amount: string
  }
  partners?: string[]
}

interface JoinProjectsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableProjects: ProjectDetailedInfo[]
  joinedProjectIds: string[]
  onJoinProject: (projectId: string) => void
}

export function JoinProjectsModal({
  open,
  onOpenChange,
  availableProjects,
  joinedProjectIds = [],
  onJoinProject
}: JoinProjectsModalProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectDetailedInfo | null>(null)
  const [joinRequested, setJoinRequested] = useState<Record<string, boolean>>({})
  const [fitLoading, setFitLoading] = useState(false)
  const [fitError, setFitError] = useState<string>("")
  const [fitResult, setFitResult] = useState<any | null>(null)

  const filteredProjects = availableProjects.filter(p => !joinedProjectIds.includes(p.id))

  const handleJoinRequest = (projectId: string) => {
    onJoinProject(projectId)
    setJoinRequested(prev => ({ ...prev, [projectId]: true }))
  }

  const analyzeFit = async () => {
    if (!selectedProject) return;
    setFitLoading(true)
    setFitError("")
    setFitResult(null)
    try {
      const res = await fetch('/api/ai-analysis/project-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze project fit')
      }
      setFitResult(data.analysis)
    } catch (e: any) {
      setFitError(e.message || 'AI analysis failed')
    } finally {
      setFitLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <span>Available Environmental Projects</span>
          </DialogTitle>
          <DialogDescription>
            Browse and join active environmental projects that align with your interests
          </DialogDescription>
        </DialogHeader>

  <div className="flex flex-col md:flex-row gap-4 overflow-hidden flex-grow min-h-0">
          {/* Projects list */}
          <div className="w-full md:w-1/3 overflow-hidden flex flex-col border rounded-md min-h-0">
            <div className="p-3 bg-muted/30 border-b">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                Available Projects
              </h4>
            </div>
            <ScrollArea className="flex-grow h-full">
              <div className="p-2 space-y-2">
                {filteredProjects.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    <div className="mb-2 flex justify-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-400 opacity-50" />
                    </div>
                    <p>You've joined all available projects!</p>
                    <p className="text-xs">Check back soon for new opportunities.</p>
                  </div>
                ) : (
                  filteredProjects.map((project) => (
                    <div 
                      key={project.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors
                        ${selectedProject?.id === project.id ? 'bg-emerald-50 border-emerald-200' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm line-clamp-1">{project.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            project.status === 'active' ? 'bg-green-50 text-green-700' : 
                            project.status === 'upcoming' ? 'bg-blue-50 text-blue-700' : 
                            'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.participants}/{project.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-1.5 flex-grow" />
                        <span className="text-xs font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Project details */}
          <div className="w-full md:w-2/3 overflow-hidden flex flex-col border rounded-md min-h-0">
            {selectedProject ? (
              <>
                <div className="p-4 bg-muted/30 border-b">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{selectedProject.title}</h3>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {selectedProject.xp}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedProject.participants}/{selectedProject.maxParticipants} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedProject.startDate} - {selectedProject.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedProject.location}
                    </span>
                  </div>
                </div>
                
                <ScrollArea className="flex-grow p-4 h-full">
                  <Tabs defaultValue="details">
                    <TabsList className="grid grid-cols-4 mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="impact">Impact</TabsTrigger>
                      <TabsTrigger value="updates">Updates</TabsTrigger>
                      <TabsTrigger value="ai-fit">AI Fit</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm">{selectedProject.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Goals</h4>
                        <ul className="text-sm space-y-1 list-disc pl-4">
                          {selectedProject.goals.map((goal, i) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <ul className="text-sm space-y-1 list-disc pl-4">
                          {selectedProject.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Project Coordinator</h4>
                        <p className="text-sm">
                          <span className="font-medium">{selectedProject.coordinator.name}</span><br/>
                          Contact: {selectedProject.coordinator.contact}
                        </p>
                      </div>
                      
                      {selectedProject.funding && (
                        <div>
                          <h4 className="font-medium mb-1">Funding</h4>
                          <p className="text-sm">
                            {selectedProject.funding.source}: {selectedProject.funding.amount}
                          </p>
                        </div>
                      )}
                      
                      {selectedProject.partners && (
                        <div>
                          <h4 className="font-medium mb-1">Partners</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedProject.partners.map((partner, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {partner}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="impact" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Environmental Impact</h4>
                        <p className="text-sm mb-3">{selectedProject.environmentalImpact.type}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedProject.environmentalImpact.metrics.treesPlanted && (
                            <div className="p-3 rounded-md bg-green-50 border border-green-200 flex flex-col items-center justify-center">
                              <div className="text-green-600 mb-1">
                                <Leaf className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-green-700">{selectedProject.environmentalImpact.metrics.treesPlanted}</span>
                              <span className="text-xs text-green-600">Trees Planted</span>
                            </div>
                          )}
                          
                          {selectedProject.environmentalImpact.metrics.co2Reduction && (
                            <div className="p-3 rounded-md bg-blue-50 border border-blue-200 flex flex-col items-center justify-center">
                              <div className="text-blue-600 mb-1">
                                <Shield className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-blue-700">{selectedProject.environmentalImpact.metrics.co2Reduction} tons</span>
                              <span className="text-xs text-blue-600">CO₂ Reduction</span>
                            </div>
                          )}
                          
                          {selectedProject.environmentalImpact.metrics.wasteRecycled && (
                            <div className="p-3 rounded-md bg-amber-50 border border-amber-200 flex flex-col items-center justify-center">
                              <div className="text-amber-600 mb-1">
                                <FileSpreadsheet className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-amber-700">{selectedProject.environmentalImpact.metrics.wasteRecycled} kg</span>
                              <span className="text-xs text-amber-600">Waste Recycled</span>
                            </div>
                          )}
                          
                          {selectedProject.environmentalImpact.metrics.areaRestored && (
                            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center">
                              <div className="text-emerald-600 mb-1">
                                <MapPin className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-emerald-700">{selectedProject.environmentalImpact.metrics.areaRestored} ha</span>
                              <span className="text-xs text-emerald-600">Area Restored</span>
                            </div>
                          )}
                          
                          {selectedProject.environmentalImpact.metrics.speciesProtected && (
                            <div className="p-3 rounded-md bg-purple-50 border border-purple-200 flex flex-col items-center justify-center">
                              <div className="text-purple-600 mb-1">
                                <Shield className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-purple-700">{selectedProject.environmentalImpact.metrics.speciesProtected}</span>
                              <span className="text-xs text-purple-600">Species Protected</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Progress</h4>
                        <div className="flex items-center gap-4 mb-1">
                          <Progress value={selectedProject.progress} className="h-2 flex-grow" />
                          <span className="text-sm font-medium">{selectedProject.progress}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{selectedProject.startDate}</span>
                          <span>{selectedProject.endDate}</span>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="updates" className="space-y-4">
                      {selectedProject.updates.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No updates available yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedProject.updates.map((update, i) => (
                            <div key={i} className="border rounded-md p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                  {update.date}
                                </Badge>
                              </div>
                              <p className="text-sm">{update.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="ai-fit" className="space-y-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h4 className="font-medium">AI Project Fit Advisor</h4>
                          <p className="text-sm text-muted-foreground">Get a quick recommendation tailored to this project’s requirements and benefits.</p>
                        </div>
                        <Button onClick={analyzeFit} disabled={fitLoading} className="bg-primary text-white">
                          {fitLoading ? 'Analyzing…' : 'Analyze Fit'}
                        </Button>
                      </div>
                      {fitError && (
                        <div className="p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
                          {fitError}
                        </div>
                      )}
                      {!fitResult && !fitLoading && !fitError && (
                        <div className="text-sm text-muted-foreground">Run the analysis to see if this project is a good match for you.</div>
                      )}
                      {fitResult && (
                        <div className="space-y-4">
                          <div className="p-3 rounded-md border">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <div className="font-medium">Recommendation</div>
                                <div className="text-muted-foreground">{fitResult.summary.quickReason}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs uppercase text-muted-foreground">Match</div>
                                <div className="text-2xl font-bold">{fitResult.summary.matchScore}%</div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Decision: <span className="font-medium">{fitResult.summary.recommendation}</span> • Confidence: {fitResult.summary.confidence}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Requirements Match</h5>
                            <div className="space-y-2">
                              {fitResult.fitAnalysis.requirementsMatch?.map((r: any, i: number) => (
                                <div key={i} className="p-2 rounded border text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{r.requirement}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{r.fit}</span>
                                  </div>
                                  {r.note && <div className="text-xs text-muted-foreground mt-1">{r.note}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <h5 className="font-medium mb-2">Benefits</h5>
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {fitResult.fitAnalysis.benefits?.map((b: string, i: number) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Risks</h5>
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {fitResult.fitAnalysis.risks?.map((r: string, i: number) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="p-3 rounded border text-sm">
                            <div className="font-medium mb-1">Effort vs Reward</div>
                            <div className="text-muted-foreground">{fitResult.fitAnalysis.effortVsReward}</div>
                          </div>
                          <div className="p-3 rounded border text-sm">
                            <div className="font-medium mb-2">Impact Overview</div>
                            <div className="text-xs text-muted-foreground mb-1">XP Reward: {fitResult.impactOverview?.xpReward ?? selectedProject.xp}</div>
                            {fitResult.impactOverview?.expectedImpact && (
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {fitResult.impactOverview.expectedImpact.map((e: string, i: number) => (
                                  <li key={i}>{e}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {fitResult.actionItems && (
                            <div>
                              <h5 className="font-medium mb-2">Suggested Next Steps</h5>
                              <ul className="list-disc pl-5 text-sm space-y-1">
                                {fitResult.actionItems.map((a: string, i: number) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
                
                <div className="p-4 border-t bg-muted/20">
                  {selectedProject.participants >= selectedProject.maxParticipants ? (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-amber-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>This project has reached its maximum participants.</span>
                      </div>
                      <Button disabled>Project Full</Button>
                    </div>
                  ) : joinRequested[selectedProject.id] ? (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Request sent! You'll be notified when approved.</span>
                      </div>
                      <Button disabled className="bg-emerald-500">Request Sent</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Join this project to earn {selectedProject.xp} and make a real impact.
                      </div>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleJoinRequest(selectedProject.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Project
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-6 text-center">
                <div className="max-w-md">
                  <Leaf className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-1">Select a project</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a project from the list to see more details and join environmental initiatives that interest you.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-2 border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
