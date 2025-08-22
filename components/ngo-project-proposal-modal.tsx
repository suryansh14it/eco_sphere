"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  DollarSign,
  FileText,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Send,
  X
} from "lucide-react"

interface ProjectData {
  title: string
  researcher: string
  researcherEmail: string
  researcherPhone: string
  status: string
  funding: string
  researcherCommission: string
  commissionPercent: number
  volunteers: number
  description: string
  timeline: string
  impact: string
  startDate: string
  endDate: string
  categories: string[]
  location: string
  sdgGoals: string[]
  keyMetrics: Record<string, string>
}

interface NGOProjectProposalModalProps {
  isOpen: boolean
  onClose: () => void
  projectData: ProjectData
  userEmail: string
  userName: string
  userId: string
}

export function NGOProjectProposalModal({
  isOpen,
  onClose,
  projectData,
  userEmail,
  userName,
  userId
}: NGOProjectProposalModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  
  const [formData, setFormData] = useState({
    ngoCommission: "",
    additionalNotes: "",
    expectedStartDate: "",
    proposedBudgetBreakdown: "",
    teamSize: "",
    experienceLevel: "",
    department: "",
    duration: "",
    proposalSummary: ""
  })

  // Auto-fill form data when modal opens
  useEffect(() => {
    if (isOpen && projectData) {
      setFormData(prev => ({
        ...prev,
        expectedStartDate: projectData.startDate || "",
        teamSize: projectData.volunteers?.toString() || ""
      }))
    }
  }, [isOpen, projectData])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        ngoCommission: "",
        additionalNotes: "",
        expectedStartDate: "",
        proposedBudgetBreakdown: "",
        teamSize: "",
        experienceLevel: "",
        department: "",
        duration: "",
        proposalSummary: ""
      })
      setIsSubmitted(false)
      setShowSuccessAnimation(false)
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateImplementationFund = () => {
    if (!formData.ngoCommission || !projectData.funding) return "₹0"
    
    const totalFunding = parseFloat(projectData.funding.replace('₹', '').replace('Cr', ''))
    const researcherCommission = parseFloat(projectData.researcherCommission.replace('₹', '').replace('L', '')) / 10 // Convert L to Cr
    const ngoCommissionPercent = parseFloat(formData.ngoCommission)
    const ngoCommissionAmount = (totalFunding * ngoCommissionPercent) / 100
    
    const ngoProjectFund = totalFunding - researcherCommission - ngoCommissionAmount
    
    return `₹${ngoProjectFund.toFixed(1)}Cr`
  }

  const calculateNGOCommissionAmount = () => {
    if (!formData.ngoCommission || !projectData.funding) return "₹0"
    
    const totalFunding = parseFloat(projectData.funding.replace('₹', '').replace('Cr', ''))
    const ngoCommissionPercent = parseFloat(formData.ngoCommission)
    const ngoCommissionAmount = (totalFunding * ngoCommissionPercent) / 100
    
    return `₹${(ngoCommissionAmount * 10).toFixed(1)}L` // Convert Cr to L for display
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation for required fields
    if (!formData.ngoCommission) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please enter your commission percentage.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    if (!formData.department) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please select a government department.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    if (!formData.proposalSummary) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please provide a government proposal summary.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    const commissionPercent = parseFloat(formData.ngoCommission)
    if (commissionPercent < 0 || commissionPercent > 20) {
      toast({
        title: "⚠️ Invalid Commission",
        description: "Commission percentage must be between 0% and 20%.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const proposalData = {
        // Proposal type and metadata
        proposalType: 'researcher-advised',
        
        // Project details (auto-filled from researcher's project)
        title: projectData.title,
        description: projectData.description,
        projectFunding: projectData.funding,
        location: projectData.location,
        timeline: formData.duration || projectData.timeline,
        categories: projectData.categories,
        sdgGoals: projectData.sdgGoals,
        expectedImpact: projectData.impact,
        keyMetrics: projectData.keyMetrics,
        
        // Researcher information (for researcher-advised proposals)
        researcher: {
          researcherId: `researcher_${projectData.researcher.toLowerCase().replace(/\s+/g, '_')}`,
          name: projectData.researcher,
          email: projectData.researcherEmail,
          phone: projectData.researcherPhone,
          commission: projectData.researcherCommission
        },
        
        // NGO information
        ngoId: userId,
        ngoName: userName,
        ngoEmail: userEmail,
        ngoCommission: formData.ngoCommission,
        ngoCommissionAmount: calculateNGOCommissionAmount(),
        
        // Government submission details
        targetDepartment: formData.department,
        proposalSummary: formData.proposalSummary,
        implementationPlan: formData.proposedBudgetBreakdown,
        
        // Project execution details
        expectedStartDate: formData.expectedStartDate,
        teamSize: formData.teamSize,
        experienceLevel: formData.experienceLevel,
        additionalNotes: formData.additionalNotes,
        
        // Financial breakdown
        implementationFund: calculateImplementationFund(),
        totalProjectCost: projectData.funding
      }

      // Since this is a researcher-advised proposal, use the researcher-proposals endpoint
      const response = await fetch('/api/researcher-proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...proposalData,
          // Additional researcher-specific fields
          researcherName: projectData.researcher,
          researcherEmail: projectData.researcherEmail,
          researcherPhone: projectData.researcherPhone,
          researcherCommission: projectData.researcherCommission,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setShowSuccessAnimation(true)
        
        // Show success toast
        toast({
          title: "🎉 Proposal Submitted Successfully!",
          description: `Your proposal for "${projectData.title}" has been submitted to the government for review and funding approval.`,
          duration: 6000,
        })
        
        // Close modal after animation
        setTimeout(() => {
          onClose()
        }, 3000)
        
      } else {
        throw new Error(result.error || 'Failed to submit proposal')
      }

    } catch (error) {
      console.error('Error submitting proposal:', error)
      toast({
        title: "❌ Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit proposal. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!projectData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Submit Researcher-Advised Project to Government
          </DialogTitle>
        </DialogHeader>

        {showSuccessAnimation ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-600">Proposal Submitted!</h3>
            <p className="text-center text-muted-foreground max-w-md">
              Your proposal has been successfully submitted to the researcher. You'll receive updates on the review process.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Overview (Auto-filled) */}
            <Card className="glass border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Project Overview (Auto-filled)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Project Title</label>
                    <Input value={projectData.title} disabled className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Location</label>
                    <Input value={projectData.location} disabled className="bg-muted/50" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                  <Textarea 
                    value={projectData.description} 
                    disabled 
                    className="bg-muted/50 min-h-[80px]" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Total Funding</label>
                    <Input value={projectData.funding} disabled className="bg-muted/50 text-green-600 font-bold" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Timeline</label>
                    <Input value={projectData.timeline} disabled className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Expected Impact</label>
                    <Input value={projectData.impact} disabled className="bg-muted/50" />
                  </div>
                </div>

                {/* Categories and SDG Goals */}
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Project Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {projectData.categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">SDG Goals</label>
                    <div className="flex flex-wrap gap-2">
                      {projectData.sdgGoals.map((goal, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Researcher Information (Auto-filled) */}
            <Card className="glass border-teal-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Researcher Information (Auto-filled)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Researcher Name</label>
                    <Input value={projectData.researcher} disabled className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input value={projectData.researcherEmail} disabled className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                    <Input value={projectData.researcherPhone} disabled className="bg-muted/50" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Researcher Commission:</span>
                    <span className="text-lg font-bold text-green-600">
                      {projectData.researcherCommission} ({projectData.commissionPercent}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NGO Commission and Details (User Input) */}
            <Card className="glass border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  Government Proposal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Government Department <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => handleInputChange('department', value)}
                    >
                      <SelectTrigger className="glass border-border/30">
                        <SelectValue placeholder="Select government department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">Environmental Protection</SelectItem>
                        <SelectItem value="urban">Urban Planning & Development</SelectItem>
                        <SelectItem value="energy">Energy & Resources</SelectItem>
                        <SelectItem value="health">Public Health</SelectItem>
                        <SelectItem value="agriculture">Agriculture & Rural Development</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="transport">Transport & Infrastructure</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      NGO Commission Percentage <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter percentage (e.g., 5)"
                      value={formData.ngoCommission}
                      onChange={(e) => handleInputChange('ngoCommission', e.target.value)}
                      className="glass border-border/30"
                      min="0"
                      max="20"
                      step="0.1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maximum 20% commission allowed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Expected Start Date</label>
                    <Input
                      type="date"
                      value={formData.expectedStartDate}
                      onChange={(e) => handleInputChange('expectedStartDate', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Team Size</label>
                    <Input
                      type="number"
                      placeholder="Number of team members"
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
                    <Select 
                      value={formData.experienceLevel} 
                      onValueChange={(value) => handleInputChange('experienceLevel', value)}
                    >
                      <SelectTrigger className="glass border-border/30">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                        <SelectItem value="experienced">Experienced (5-10 years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Project Duration</label>
                    <Input
                      value={formData.duration || projectData.timeline}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 24 months"
                      className="glass border-border/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Proposed Budget Breakdown</label>
                  <Textarea
                    placeholder="Describe how you plan to allocate the project funds..."
                    value={formData.proposedBudgetBreakdown}
                    onChange={(e) => handleInputChange('proposedBudgetBreakdown', e.target.value)}
                    className="glass border-border/30 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Government Proposal Summary <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Summarize why this project should receive government funding, expected outcomes, and public benefit..."
                    value={formData.proposalSummary}
                    onChange={(e) => handleInputChange('proposalSummary', e.target.value)}
                    className="glass border-border/30 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Additional Notes</label>
                  <Textarea
                    placeholder="Any additional information, concerns, or special requirements..."
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className="glass border-border/30 min-h-[80px]"
                  />
                </div>

                {/* Financial Summary */}
                {formData.ngoCommission && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-foreground mb-3">Financial Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Project Funding:</span>
                        <span className="font-bold text-blue-600">{projectData.funding}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Researcher Commission:</span>
                        <span className="font-bold text-green-600">{projectData.researcherCommission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NGO Commission ({formData.ngoCommission}%):</span>
                        <span className="font-bold text-orange-600">{calculateNGOCommissionAmount()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium text-foreground">Implementation Fund:</span>
                        <span className="font-bold text-purple-600 text-lg">{calculateImplementationFund()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.ngoCommission}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Proposal...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
