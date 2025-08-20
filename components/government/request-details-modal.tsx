"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, CheckCircle2, DollarSign, FileText, HandCoins, Leaf, MapPin, Send, ShieldAlert, Target, Upload, Users } from "lucide-react";

export interface GovNewRequestDetail {
  id: string;
  title: string;
  organization: string;
  location: string;
  priority: "High" | "Medium" | "Low";
  requestedFunding: string;
  // Breakdown of total funding asked: project amount + commissions
  fundingBreakdown?: {
    total: string; // should match requestedFunding
    projectAmount: string;
    ngoCommission: string;
    researcherCommission: string;
    ngoCommissionPercent?: number;
    researcherCommissionPercent?: number;
  };
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
  // Negotiation status and details
  negotiation?: {
    status: "initial" | "govt_offered" | "ngo_countered" | "accepted" | "approved" | "rejected";
    govtOffer?: {
      total: string;
      projectAmount: string;
      ngoCommission: string;
      researcherCommission: string;
      ngoCommissionPercent?: number;
      researcherCommissionPercent?: number;
      notes?: string;
    };
    ngoCounterOffer?: {
      total: string;
      projectAmount: string;
      ngoCommission: string;
      researcherCommission: string;
      ngoCommissionPercent?: number;
      researcherCommissionPercent?: number;
      notes?: string;
    };
  };
  payment?: {
    upiId?: string;
    qrCode?: string;
    status: "pending" | "completed";
    receipt?: string; // URL to uploaded payment receipt
    verificationStatus?: "pending" | "verified" | "rejected";
  };
}

export function GovRequestDetailsModal({
  open,
  onOpenChange,
  request,
  onAcceptProposal,
  onSendOffer,
  onApproveProject,
  onUploadPaymentReceipt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: GovNewRequestDetail | null;
  onAcceptProposal?: (requestId: string) => void;
  onSendOffer?: (requestId: string, offerDetails: NonNullable<GovNewRequestDetail['negotiation']>['govtOffer']) => void;
  onApproveProject?: (requestId: string) => void;
  onUploadPaymentReceipt?: (requestId: string, receipt: string) => void;
}) {
  const [isOfferMode, setIsOfferMode] = useState(false);
  const [isPaymentMode, setIsPaymentMode] = useState(false);
  const [offerDetails, setOfferDetails] = useState({
    total: "",
    projectAmount: "",
    ngoCommission: "",
    researcherCommission: "",
    ngoCommissionPercent: 0,
    researcherCommissionPercent: 0,
    notes: ""
  });
  const [paymentReceipt, setPaymentReceipt] = useState("");

  if (!request) return null;
  
  const handleOfferSubmit = () => {
    if (onSendOffer) {
      onSendOffer(request.id, offerDetails);
      setIsOfferMode(false);
    }
  };
  
  const handlePaymentSubmit = () => {
    if (onUploadPaymentReceipt && paymentReceipt) {
      onUploadPaymentReceipt(request.id, paymentReceipt);
      setIsPaymentMode(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0 w-[90vw]">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            {request.title}
          </DialogTitle>
          <DialogDescription>
            Proposed by {request.organization}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-6 bg-muted/20">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{request.location}</span>
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{request.requestedFunding}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{request.proposedTimeline.start} - {request.proposedTimeline.end}</span>
          </div>
          <Badge variant={request.priority === "High" ? "destructive" : "secondary"}>{request.priority}</Badge>
        </div>

        <div className="flex-1 overflow-hidden px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5 mb-2 sticky top-0 z-10 bg-background">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
              <TabsTrigger value="proposal">Proposal</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(60vh-80px)]">
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

            <TabsContent value="funding" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Funding Breakdown</h3>
                {!request.fundingBreakdown ? (
                  <div className="text-sm text-muted-foreground">
                    Total funding requested: <span className="font-medium text-foreground">{request.requestedFunding}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-md border bg-muted/20">
                        <div className="text-xs text-muted-foreground">Amount for Project</div>
                        <div className="font-medium">{request.fundingBreakdown.projectAmount}</div>
                      </div>
                      <div className="p-3 rounded-md border bg-muted/20">
                        <div className="text-xs text-muted-foreground">NGO Commission{typeof request.fundingBreakdown.ngoCommissionPercent === 'number' ? ` (${request.fundingBreakdown.ngoCommissionPercent}%)` : ''}</div>
                        <div className="font-medium">{request.fundingBreakdown.ngoCommission}</div>
                      </div>
                      <div className="p-3 rounded-md border bg-muted/20">
                        <div className="text-xs text-muted-foreground">Researcher Commission{typeof request.fundingBreakdown.researcherCommissionPercent === 'number' ? ` (${request.fundingBreakdown.researcherCommissionPercent}%)` : ''}</div>
                        <div className="font-medium">{request.fundingBreakdown.researcherCommission}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Total Funding Asked</div>
                      <div className="text-base font-semibold flex items-center gap-1"><DollarSign className="w-4 h-4" />{request.fundingBreakdown.total}</div>
                    </div>
                  </div>
                )}
              </div>
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
        </div>

        {isOfferMode ? (
          <div className="border-t px-6 pt-4 overflow-y-auto max-h-[60vh]">
            <h3 className="text-lg font-medium mb-3">Send Counter Offer</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="projectAmount">Project Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <Input 
                    id="projectAmount" 
                    className="pl-7" 
                    placeholder="0.00"
                    value={offerDetails.projectAmount}
                    onChange={(e) => setOfferDetails({...offerDetails, projectAmount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ngoCommission">NGO Commission</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <Input 
                    id="ngoCommission" 
                    className="pl-7" 
                    placeholder="0.00"
                    value={offerDetails.ngoCommission}
                    onChange={(e) => setOfferDetails({...offerDetails, ngoCommission: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="researcherCommission">Researcher Commission</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <Input 
                    id="researcherCommission" 
                    className="pl-7" 
                    placeholder="0.00"
                    value={offerDetails.researcherCommission}
                    onChange={(e) => setOfferDetails({...offerDetails, researcherCommission: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="total">Total Offer</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <Input 
                    id="total" 
                    className="pl-7" 
                    placeholder="0.00"
                    value={offerDetails.total}
                    onChange={(e) => setOfferDetails({...offerDetails, total: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                placeholder="Explain your offer (optional)"
                className="min-h-[100px]"
                value={offerDetails.notes}
                onChange={(e) => setOfferDetails({...offerDetails, notes: e.target.value})}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOfferMode(false)}>Cancel</Button>
              <Button className="gap-2" onClick={handleOfferSubmit}>
                <Send className="w-4 h-4" />
                Send Offer
              </Button>
            </DialogFooter>
          </div>
        ) : isPaymentMode ? (
          <div className="border-t px-6 pt-4 overflow-y-auto max-h-[60vh]">
            <h3 className="text-lg font-medium mb-3">Complete Payment</h3>
            <div className="flex flex-col items-center justify-center space-y-4 mb-4">
              {request.payment?.qrCode ? (
                <div className="bg-white p-3 rounded-lg">
                  <img src={request.payment.qrCode} alt="Payment QR Code" className="w-48 h-48" />
                </div>
              ) : (
                <div className="text-center space-y-2 p-6">
                  <div className="text-lg font-medium">UPI ID</div>
                  <div className="bg-muted/30 px-4 py-2 rounded-md">{request.payment?.upiId || "ecosphere@upi"}</div>
                </div>
              )}
              
              <div className="font-medium text-center">
                Total Amount: <span className="text-lg text-primary">{offerDetails.total || request.requestedFunding}</span>
              </div>
              
              <div className="w-full mt-4">
                <Label htmlFor="receipt">Upload Payment Receipt</Label>
                <div className="mt-2 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 cursor-pointer hover:bg-muted/10">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mb-2 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload payment receipt or<br /> drag and drop
                    </p>
                    <input 
                      type="file" 
                      className="hidden" 
                      id="receipt" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // In a real app, you would upload this to your server
                          setPaymentReceipt(`receipt-${Date.now()}.jpg`);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentMode(false)}>Cancel</Button>
              <Button 
                className="gap-2" 
                onClick={handlePaymentSubmit} 
                disabled={!paymentReceipt}
              >
                <Check className="w-4 h-4" />
                Complete Payment
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <DialogFooter className="border-t px-6 py-3 flex justify-between sticky bottom-0 bg-background">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
            <div className="flex gap-2">
              {!request.negotiation || request.negotiation.status === "initial" ? (
                <>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      if (onAcceptProposal) onAcceptProposal(request.id);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Proposal
                  </Button>
                  <Button 
                    onClick={() => setIsOfferMode(true)}
                    className="gap-2"
                  >
                    <HandCoins className="w-4 h-4" />
                    Send Counter Offer
                  </Button>
                </>
              ) : request.negotiation.status === "ngo_countered" ? (
                <>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      if (onAcceptProposal) onAcceptProposal(request.id);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Counter Offer
                  </Button>
                  <Button 
                    onClick={() => setIsOfferMode(true)}
                    className="gap-2"
                  >
                    <HandCoins className="w-4 h-4" />
                    Send New Offer
                  </Button>
                </>
              ) : request.negotiation.status === "accepted" ? (
                <>
                  <Button 
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => setIsPaymentMode(true)}
                  >
                    <DollarSign className="w-4 h-4" />
                    Make Payment & Approve
                  </Button>
                </>
              ) : null}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
