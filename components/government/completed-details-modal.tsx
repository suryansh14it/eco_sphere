"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, DollarSign, Leaf, MapPin, ShieldCheck, Star } from "lucide-react";

export interface GovCompletedDetail {
  id: string;
  title: string;
  completionDate: string;
  funding: string;
  impactSummary: string;
  location?: string;
  outcomes: { label: string; value: string }[];
  metrics?: {
    co2ReductionTons?: number;
    treesPlanted?: number;
    waterCleanedKm?: number;
    speciesProtected?: number;
  };
  lessons?: string[];
  documents?: { name: string; url?: string }[];
}

export function GovCompletedDetailsModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: GovCompletedDetail | null;
}) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col w-[90vw] p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            {project.title}
          </DialogTitle>
          <DialogDescription>Completed on {project.completionDate}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-4 bg-muted/20 rounded-md">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{project.funding}</span>
            {project.location && (<span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.location}</span>)}
          </div>
          <Badge variant="outline">Archived</Badge>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[50vh] pr-2">
            <TabsContent value="summary" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Impact Summary</h3>
                <p className="text-sm text-muted-foreground">{project.impactSummary}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                {project.outcomes.map((o, i) => (
                  <div key={i} className="p-3 border rounded-md bg-muted/20">
                    <div className="text-xs text-muted-foreground">{o.label}</div>
                    <div className="font-medium">{o.value}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="metrics" className="space-y-3">
              {!project.metrics ? (
                <div className="text-sm text-muted-foreground">No metrics recorded.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {project.metrics.co2ReductionTons && (
                    <div className="p-3 rounded-md bg-blue-50 border border-blue-100">
                      <div className="text-xs text-blue-700">CO₂ Reduced</div>
                      <div className="font-semibold text-blue-800">{project.metrics.co2ReductionTons} tons</div>
                    </div>
                  )}
                  {project.metrics.treesPlanted && (
                    <div className="p-3 rounded-md bg-emerald-50 border border-emerald-100">
                      <div className="text-xs text-emerald-700">Trees Planted</div>
                      <div className="font-semibold text-emerald-800">{project.metrics.treesPlanted}</div>
                    </div>
                  )}
                  {project.metrics.waterCleanedKm && (
                    <div className="p-3 rounded-md bg-cyan-50 border border-cyan-100">
                      <div className="text-xs text-cyan-700">Water Cleaned</div>
                      <div className="font-semibold text-cyan-800">{project.metrics.waterCleanedKm} km</div>
                    </div>
                  )}
                  {project.metrics.speciesProtected && (
                    <div className="p-3 rounded-md bg-orange-50 border border-orange-100">
                      <div className="text-xs text-orange-700">Species Protected</div>
                      <div className="font-semibold text-orange-800">{project.metrics.speciesProtected}</div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="lessons" className="space-y-3">
              {(!project.lessons || project.lessons.length === 0) ? (
                <div className="text-sm text-muted-foreground">No lessons captured.</div>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {project.lessons.map((l, i) => <li key={i} className="text-sm">{l}</li>)}
                </ul>
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
