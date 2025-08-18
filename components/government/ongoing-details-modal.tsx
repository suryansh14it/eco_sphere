"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, MapPin, Users, Activity, ClipboardList, Wrench } from "lucide-react";

export interface GovOngoingDetail {
  id: string;
  title: string;
  funding: string;
  status: "On Track" | "Delayed" | "Ahead";
  progress: number;
  deadline: string;
  location?: string;
  description?: string;
  workstreams?: { name: string; progress: number; owner?: string }[];
  issues?: { date: string; title: string; severity: "low" | "medium" | "high"; notes?: string }[];
  team?: { role: string; name: string }[];
}

export function GovOngoingDetailsModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: GovOngoingDetail | null;
}) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{project.title}</DialogTitle>
          <DialogDescription>Deadline: {project.deadline}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-4 bg-muted/20 rounded-md">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{project.funding}</span>
            {project.location && (<span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.location}</span>)}
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{project.deadline}</span>
          </div>
          <Badge variant={project.status === "Delayed" ? "destructive" : project.status === "Ahead" ? "secondary" : "default"}>{project.status}</Badge>
        </div>

        <div className="py-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2.5" />
        </div>

        <Tabs defaultValue="workstreams" className="w-full">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="workstreams">Workstreams</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] pr-2">
            <TabsContent value="workstreams" className="space-y-3">
              {(!project.workstreams || project.workstreams.length === 0) ? (
                <div className="text-sm text-muted-foreground">No workstreams defined.</div>
              ) : project.workstreams.map((ws, i) => (
                <div key={i} className="p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm"><ClipboardList className="w-4 h-4" /> {ws.name}</div>
                    {ws.owner && <Badge variant="outline">{ws.owner}</Badge>}
                  </div>
                  <Progress value={ws.progress} className="h-2" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="issues" className="space-y-3">
              {(!project.issues || project.issues.length === 0) ? (
                <div className="text-sm text-muted-foreground">No issues reported.</div>
              ) : project.issues.map((iss, i) => (
                <div key={i} className="p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{iss.title}</span>
                    <Badge variant={iss.severity === "high" ? "destructive" : iss.severity === "medium" ? "secondary" : "outline"}>{iss.severity}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{iss.date}</div>
                  {iss.notes && <p className="text-sm">{iss.notes}</p>}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="team" className="space-y-3">
              {(!project.team || project.team.length === 0) ? (
                <div className="text-sm text-muted-foreground">No team assigned.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {project.team.map((m, i) => (
                    <div key={i} className="p-3 rounded-md border bg-muted/20">
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.role}</div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
