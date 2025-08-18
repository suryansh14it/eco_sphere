"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, FileText, Leaf, MapPin, ShieldAlert, Target, Users } from "lucide-react";

export interface GovNewRequestDetail {
  id: string;
  title: string;
  organization: string;
  location: string;
  priority: "High" | "Medium" | "Low";
  requestedFunding: string;
  description: string;
  objectives: string[];
  proposedTimeline: {
    start: string;
    end: string;
    milestones?: { name: string; due: string; notes?: string }[];
  };
  proposedImpact: {
    summary: string;
    co2ReductionTons?: number;
    treesPlanted?: number;
    areaRestoredHa?: number;
    speciesProtected?: number;
  };
  requirements: string[];
  coordinator?: { name: string; contact: string };
  attachments?: { name: string; url?: string }[];
}

export function GovRequestDetailsModal({
  open,
  onOpenChange,
  request,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: GovNewRequestDetail | null;
}) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            {request.title}
          </DialogTitle>
          <DialogDescription>
            Proposed by {request.organization}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-4 bg-muted/20 rounded-md">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{request.location}</span>
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{request.requestedFunding}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{request.proposedTimeline.start} - {request.proposedTimeline.end}</span>
          </div>
          <Badge variant={request.priority === "High" ? "destructive" : "secondary"}>{request.priority}</Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[50vh] pr-2">
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{request.description}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-emerald-600" /> Objectives</h4>
                <ul className="text-sm space-y-2">
                  {request.objectives.map((o, i) => (
                    <li key={i} className="flex gap-2 items-start"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />{o}</li>
                  ))}
                </ul>
              </div>
              {request.coordinator && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-1">Coordinator</h4>
                    <p className="text-sm">{request.coordinator.name} — {request.coordinator.contact}</p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="proposal" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Requirements</h4>
                <ul className="text-sm space-y-2">
                  {request.requirements.map((r, i) => (
                    <li key={i} className="flex gap-2 items-start"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />{r}</li>
                  ))}
                </ul>
              </div>
              {request.attachments && request.attachments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {request.attachments.map((f, i) => (
                        <Badge key={i} variant="outline" className="bg-muted/40 cursor-default">{f.name}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1">Proposed Impact</h3>
                <p className="text-sm text-muted-foreground mb-3">{request.proposedImpact.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  {request.proposedImpact.co2ReductionTons && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-2 text-sm"><ShieldAlert className="w-4 h-4 text-emerald-700" /> CO₂ Reduction</div>
                      <div className="text-emerald-700 font-semibold">{request.proposedImpact.co2ReductionTons} tons</div>
                    </div>
                  )}
                  {request.proposedImpact.treesPlanted && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex items-center gap-2 text-sm"><Leaf className="w-4 h-4 text-green-700" /> Trees Planted</div>
                      <div className="text-green-700 font-semibold">{request.proposedImpact.treesPlanted}</div>
                    </div>
                  )}
                  {request.proposedImpact.areaRestoredHa && (
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="flex items-center gap-2 text-sm">Area Restored</div>
                      <div className="text-purple-700 font-semibold">{request.proposedImpact.areaRestoredHa} ha</div>
                    </div>
                  )}
                  {request.proposedImpact.speciesProtected && (
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                      <div className="flex items-center gap-2 text-sm">Species Protected</div>
                      <div className="text-orange-700 font-semibold">{request.proposedImpact.speciesProtected}</div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="space-y-3">
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-sm flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5" />
                <p>Preliminary risk assessment required. Ensure due diligence, community consent, and environmental clearances before approval.</p>
              </div>
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
