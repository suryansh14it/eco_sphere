"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Brain, AlertTriangle, CheckCircle, XCircle, Leaf, DollarSign, BarChart3, Shield, Settings } from "lucide-react"

interface ProjectData {
  title: string
  organization: string
  funding: string
  location: string
  priority: string
  description?: string
}

interface AnalysisItem {
  type: string
  title: string
  content: string
}

interface AnalysisSection {
  title: string
  icon: string
  items: AnalysisItem[]
}

interface AnalysisSummary {
  recommendation: "APPROVE" | "REJECT" | "APPROVE_WITH_CONDITIONS" | "NEEDS_MODIFICATION"
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW"
  overallScore: number
  keyHighlights: string[]
}

interface AnalysisResponse {
  summary: AnalysisSummary
  sections: AnalysisSection[]
}

interface AIAnalysisModalProps {
  projectData: ProjectData
  children: React.ReactNode
}

export function AIAnalysisModal({ projectData, children }: AIAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [open, setOpen] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    setError("")
    setAnalysis(null)

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze project')
      }

      setAnalysis(data.analysis)
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis')
    } finally {
      setLoading(false)
    }
  }

  const getSectionIcon = (iconType: string) => {
    switch (iconType) {
      case 'environment':
        return <Leaf className="w-5 h-5 text-green-600" />
      case 'financial':
        return <DollarSign className="w-5 h-5 text-blue-600" />
      case 'implementation':
        return <Settings className="w-5 h-5 text-purple-600" />
      case 'risk':
        return <Shield className="w-5 h-5 text-orange-600" />
      case 'recommendation':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      default:
        return <Brain className="w-5 h-5 text-primary" />
    }
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'decision':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <div className="w-4 h-4 rounded-full bg-primary/20" />
    }
  }

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'APPROVE':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approve</Badge>
      case 'REJECT':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Reject</Badge>
      case 'APPROVE_WITH_CONDITIONS':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Approve with Conditions</Badge>
      case 'NEEDS_MODIFICATION':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Needs Modification</Badge>
      default:
        return <Badge variant="secondary">Under Review</Badge>
    }
  }

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <Badge className="bg-green-100 text-green-700">High Confidence</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium Confidence</Badge>
      case 'LOW':
        return <Badge className="bg-red-100 text-red-700">Low Confidence</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw] overflow-hidden p-8">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-primary" />
            AI Environmental Impact Analysis
          </DialogTitle>
          <DialogDescription className="text-base">
            Comprehensive AI analysis for: <strong className="text-foreground">{projectData.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full min-h-0 space-y-4">
          {/* Project Summary */}
          <div className="flex-shrink-0 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Project Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="break-words">
                <span className="text-muted-foreground">Organization:</span> {projectData.organization}
              </div>
              <div className="break-words">
                <span className="text-muted-foreground">Location:</span> {projectData.location}
              </div>
              <div className="break-words">
                <span className="text-muted-foreground">Funding:</span> {projectData.funding}
              </div>
              <div className="break-words">
                <span className="text-muted-foreground">Priority:</span>
                <Badge 
                  variant={projectData.priority === "High" ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {projectData.priority}
                </Badge>
              </div>
            </div>
          </div>

          {!analysis && !loading && !error && (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="text-center py-12 max-w-md">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Ready for AI Analysis
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Get comprehensive environmental impact analysis powered by GPT-4. 
                    Our AI will evaluate environmental benefits, financial feasibility, 
                    implementation risks, and provide actionable recommendations.
                  </p>
                  <Button onClick={handleAnalyze} className="gap-2 px-6">
                    <Brain className="w-4 h-4" />
                    Start AI Analysis
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="text-center py-12">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
                  <div className="absolute inset-0 w-12 h-12 mx-auto">
                    <Brain className="w-12 h-12 text-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    Analyzing Environmental Impact...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is evaluating the project's environmental benefits, risks, and financial feasibility.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This may take 30-60 seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div>
                      <span className="font-medium text-red-700 dark:text-red-300">Analysis Failed</span>
                    </div>
                    <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed break-words">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 border-red-300 text-red-700 hover:bg-red-50" 
                      onClick={handleAnalyze}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analysis && (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-[55vh] pr-4">
                <div className="space-y-6">
                  {/* Analysis Summary */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Analysis Summary</h3>
                      <div className="flex items-center gap-2">
                        {getRecommendationBadge(analysis.summary.recommendation)}
                        {getConfidenceBadge(analysis.summary.confidenceLevel)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analysis.summary.overallScore)}`}>
                          {analysis.summary.overallScore}/10
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Key Highlights</p>
                        <ul className="space-y-1">
                          {analysis.summary.keyHighlights.map((highlight, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span className="break-words">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Sections */}
                  {analysis.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getSectionIcon(section.icon)}
                        </div>
                        <h3 className="font-semibold text-lg text-foreground break-words">
                          {section.title}
                        </h3>
                      </div>
                      
                      <div className="ml-8 space-y-4">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-start gap-3 mb-2">
                              {getItemTypeIcon(item.type)}
                              <h4 className="font-medium text-foreground break-words">
                                {item.title}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed break-words ml-7">
                              {item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {sectionIndex < analysis.sections.length - 1 && (
                        <Separator className="my-6" />
                      )}
                    </div>
                  ))}
                  
                  {/* Analysis Footer */}
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        AI Analysis Complete
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed break-words">
                      This analysis is generated by AI and should be reviewed by environmental experts and policy makers before making final decisions.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
