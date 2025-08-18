"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  MapPin,
  Leaf,
  ShieldCheck,
  Target,
  FileText,
  Info,
  Heart,
  Star
} from "lucide-react";

interface ProjectDetailedInfo {
  id: string;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  progress: number;
  status: "active" | "completed" | "upcoming";
  impact: string;
  xp: string;
  description: string;
  environmentalImpact: {
    type: string;
    metrics: {
      treesPlanted?: number;
      co2Reduction?: number;
      wasteRecycled?: number;
      areaRestored?: number;
      speciesProtected?: number;
    };
  };
  goals: string[];
  requirements: string[];
  updates: {
    date: string;
    content: string;
  }[];
  gallery?: string[];
  coordinator: {
    name: string;
    contact: string;
  };
  funding?: {
    source: string;
    amount: string;
  };
  partners?: string[];
}

interface ProjectDetailsModalProps {
  project: ProjectDetailedInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailsModal({
  project,
  open,
  onOpenChange
}: ProjectDetailsModalProps) {
  if (!project) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            {project.title}
          </DialogTitle>
          <DialogDescription>
            Organized by {project.organization}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-4 bg-muted/20 rounded-md">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-emerald-600" />
              {project.participants}/{project.maxParticipants}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              {project.startDate} - {project.endDate}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-red-600" />
              {project.location}
            </span>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">
            {project.xp}
          </Badge>
        </div>

        <div className="flex-grow overflow-hidden">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-grow h-[50vh]">
              <TabsContent value="details" className="p-2 space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">About This Project</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    Project Goals
                  </h4>
                  <ul className="space-y-2">
                    {project.goals.map((goal, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <div className="mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    Requirements
                  </h4>
                  <ul className="space-y-2">
                    {project.requirements.map((req, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <div className="mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        </div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Project Coordinator</h4>
                    <p className="text-sm">
                      <strong>{project.coordinator.name}</strong><br />
                      Contact: {project.coordinator.contact}
                    </p>
                  </div>

                  {project.funding && (
                    <div>
                      <h4 className="font-medium mb-2">Funding</h4>
                      <p className="text-sm">
                        <strong>{project.funding.source}</strong><br />
                        Amount: {project.funding.amount}
                      </p>
                    </div>
                  )}
                </div>

                {project.partners && (
                  <div>
                    <h4 className="font-medium mb-2">Project Partners</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.partners.map((partner, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-50">{partner}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress" className="p-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Project Timeline</h3>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}% Complete</span>
                      </div>
                      <Progress value={project.progress} className="h-2.5" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        <span className="block font-medium">Start Date</span>
                        {project.startDate}
                      </div>
                      <div className="text-right">
                        <span className="block font-medium">End Date</span>
                        {project.endDate}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Participation</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                        <div className="font-bold text-2xl text-emerald-700">{project.participants}</div>
                        <div className="text-sm text-emerald-600">Current Participants</div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-center">
                        <div className="font-bold text-2xl text-blue-700">{project.maxParticipants - project.participants}</div>
                        <div className="text-sm text-blue-600">Spots Remaining</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="impact" className="p-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Environmental Impact</h3>
                    <p className="text-sm mb-4">{project.environmentalImpact.type}</p>

                    <div className="grid grid-cols-2 gap-3">
                      {project.environmentalImpact.metrics.treesPlanted && (
                        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                            <Leaf className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-bold text-emerald-700">{project.environmentalImpact.metrics.treesPlanted}</div>
                            <div className="text-xs text-emerald-600">Trees Planted</div>
                          </div>
                        </div>
                      )}

                      {project.environmentalImpact.metrics.co2Reduction && (
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-blue-700">{project.environmentalImpact.metrics.co2Reduction} tons</div>
                            <div className="text-xs text-blue-600">CO₂ Reduced</div>
                          </div>
                        </div>
                      )}

                      {project.environmentalImpact.metrics.wasteRecycled && (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex items-center">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <FileText className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="font-bold text-amber-700">{project.environmentalImpact.metrics.wasteRecycled} kg</div>
                            <div className="text-xs text-amber-600">Waste Recycled</div>
                          </div>
                        </div>
                      )}

                      {project.environmentalImpact.metrics.areaRestored && (
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100 flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <Heart className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-bold text-purple-700">{project.environmentalImpact.metrics.areaRestored} ha</div>
                            <div className="text-xs text-purple-600">Area Restored</div>
                          </div>
                        </div>
                      )}

                      {project.environmentalImpact.metrics.speciesProtected && (
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 flex items-center">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                            <Star className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-bold text-orange-700">{project.environmentalImpact.metrics.speciesProtected}</div>
                            <div className="text-xs text-orange-600">Species Protected</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="updates" className="p-2">
                {project.updates.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No updates have been posted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.updates.map((update, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {update.date}
                          </Badge>
                        </div>
                        <p className="text-sm">{update.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
