"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Target,
  TreePine,
  Building
} from "lucide-react"

interface LocalInitiativeModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userName: string
  userId: string
}

export function LocalInitiativeModal({
  isOpen,
  onClose,
  userEmail,
  userName,
  userId
}: LocalInitiativeModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectFunding: "",
    location: "",
    timeline: "",
    department: "",
    ngoCommission: "",
    proposalSummary: "",
    implementationPlan: "",
    expectedStartDate: "",
    teamSize: "",
    experienceLevel: "",
    additionalNotes: "",
    categories: [] as string[],
    sdgGoals: [] as string[],
    expectedImpact: "",
    keyMetrics: {
      volunteers: "",
      beneficiaries: "",
      areaImpact: "",
      carbonReduction: ""
    }
  })

  const handleInputChange = (field: string, value: string | string[]) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const calculateNGOCommissionAmount = () => {
    if (!formData.projectFunding || !formData.ngoCommission) return "$0"
    const funding = parseFloat(formData.projectFunding.replace(/[$,]/g, ''))
    const commission = parseFloat(formData.ngoCommission) / 100
    return `$${(funding * commission).toLocaleString()}`
  }

  const calculateImplementationFund = () => {
    if (!formData.projectFunding || !formData.ngoCommission) return "$0"
    const funding = parseFloat(formData.projectFunding.replace(/[$,]/g, ''))
    const commission = parseFloat(formData.ngoCommission) / 100
    return `$${(funding - funding * commission).toLocaleString()}`
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleSDGChange = (sdg: string) => {
    setFormData(prev => ({
      ...prev,
      sdgGoals: prev.sdgGoals.includes(sdg)
        ? prev.sdgGoals.filter(s => s !== sdg)
        : [...prev.sdgGoals, sdg]
    }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      projectFunding: "",
      location: "",
      timeline: "",
      department: "",
      ngoCommission: "",
      proposalSummary: "",
      implementationPlan: "",
      expectedStartDate: "",
      teamSize: "",
      experienceLevel: "",
      additionalNotes: "",
      categories: [],
      sdgGoals: [],
      expectedImpact: "",
      keyMetrics: {
        volunteers: "",
        beneficiaries: "",
        areaImpact: "",
        carbonReduction: ""
      }
    })
    setIsSubmitted(false)
    setShowSuccessAnimation(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation for required fields
    const requiredFields = [
      'title', 'description', 'projectFunding', 'location', 
      'timeline', 'department', 'ngoCommission', 'proposalSummary'
    ]

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "⚠️ Missing Information",
          description: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
          variant: "destructive",
          duration: 4000,
        })
        return
      }
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
        proposalType: 'local-initiative',
        
        // Project details
        title: formData.title,
        description: formData.description,
        projectFunding: formData.projectFunding,
        location: formData.location,
        timeline: formData.timeline,
        categories: formData.categories,
        sdgGoals: formData.sdgGoals,
        expectedImpact: formData.expectedImpact,
        keyMetrics: formData.keyMetrics,
        
        // No researcher for local initiatives
        researcher: null,
        
        // NGO information
        ngoId: userId,
        ngoName: userName,
        ngoEmail: userEmail,
        ngoCommission: formData.ngoCommission,
        ngoCommissionAmount: calculateNGOCommissionAmount(),
        
        // Government submission details
        targetDepartment: formData.department,
        proposalSummary: formData.proposalSummary,
        implementationPlan: formData.implementationPlan,
        
        // Project execution details
        expectedStartDate: formData.expectedStartDate,
        teamSize: formData.teamSize,
        experienceLevel: formData.experienceLevel,
        additionalNotes: formData.additionalNotes,
        
        // Financial breakdown
        implementationFund: calculateImplementationFund(),
        totalProjectCost: formData.projectFunding
      }

      const response = await fetch('/api/government-proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposalData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setShowSuccessAnimation(true)
        
        // Show success toast
        toast({
          title: "🎉 Local Initiative Submitted Successfully!",
          description: `Your local initiative "${formData.title}" has been submitted to the government for review and funding approval.`,
          duration: 6000,
        })
        
        // Close modal after animation
        setTimeout(() => {
          onClose()
          resetForm()
        }, 3000)
        
      } else {
        throw new Error(result.error || 'Failed to submit local initiative')
      }

    } catch (error) {
      console.error('Error submitting local initiative:', error)
      toast({
        title: "❌ Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit local initiative. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <TreePine className="w-6 h-6 text-green-600" />
            Create Local Environmental Initiative
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            {showSuccessAnimation && (
              <div className="animate-bounce">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
            )}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-green-600">Initiative Submitted Successfully!</h3>
              <p className="text-muted-foreground max-w-md">
                Your local initiative has been submitted to the government for review. You'll receive updates on the approval process.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Making a difference in your community!</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Basic Information */}
            <Card className="glass border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter your project title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="glass border-border/30"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe your environmental initiative in detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="glass border-border/30 min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Project Location <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Downtown Vancouver, BC"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Timeline <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., 18 months"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Requested Funding <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., $50,000"
                    value={formData.projectFunding}
                    onChange={(e) => handleInputChange('projectFunding', e.target.value)}
                    className="glass border-border/30"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Categories and SDG Goals */}
            <Card className="glass border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Project Focus & Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Project Categories</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Climate Action', 'Clean Water', 'Renewable Energy', 'Waste Management', 'Biodiversity', 'Air Quality'].map((category) => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">UN SDG Goals</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['SDG 6: Clean Water', 'SDG 7: Clean Energy', 'SDG 11: Sustainable Cities', 'SDG 13: Climate Action', 'SDG 14: Life Below Water', 'SDG 15: Life on Land'].map((sdg) => (
                      <label key={sdg} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sdgGoals.includes(sdg)}
                          onChange={() => handleSDGChange(sdg)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{sdg}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Expected Impact</label>
                  <Textarea
                    placeholder="Describe the expected environmental and community impact..."
                    value={formData.expectedImpact}
                    onChange={(e) => handleInputChange('expectedImpact', e.target.value)}
                    className="glass border-border/30 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Volunteers Needed</label>
                    <Input
                      placeholder="e.g., 50"
                      value={formData.keyMetrics.volunteers}
                      onChange={(e) => handleInputChange('keyMetrics.volunteers', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Beneficiaries</label>
                    <Input
                      placeholder="e.g., 1,000"
                      value={formData.keyMetrics.beneficiaries}
                      onChange={(e) => handleInputChange('keyMetrics.beneficiaries', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Area Impact</label>
                    <Input
                      placeholder="e.g., 5 km²"
                      value={formData.keyMetrics.areaImpact}
                      onChange={(e) => handleInputChange('keyMetrics.areaImpact', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Carbon Reduction</label>
                    <Input
                      placeholder="e.g., 100 tons CO2"
                      value={formData.keyMetrics.carbonReduction}
                      onChange={(e) => handleInputChange('keyMetrics.carbonReduction', e.target.value)}
                      className="glass border-border/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Government Submission Details */}
            <Card className="glass border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-orange-600" />
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
                      placeholder="Enter percentage (e.g., 8)"
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

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Government Proposal Summary <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Summarize why this initiative should receive government funding, expected outcomes, and public benefit..."
                    value={formData.proposalSummary}
                    onChange={(e) => handleInputChange('proposalSummary', e.target.value)}
                    className="glass border-border/30 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Implementation Plan</label>
                  <Textarea
                    placeholder="Describe how you plan to implement this initiative and allocate funds..."
                    value={formData.implementationPlan}
                    onChange={(e) => handleInputChange('implementationPlan', e.target.value)}
                    className="glass border-border/30 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {formData.ngoCommission && formData.projectFunding && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-foreground mb-3">Financial Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Requested Funding:</span>
                        <span className="font-bold text-blue-600">{formData.projectFunding}</span>
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
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Initiative...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Submit to Government
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
