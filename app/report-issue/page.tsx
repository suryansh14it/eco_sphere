"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Bell,
  User,
  Leaf,
  Camera,
  Upload,
  MapPin,
  ArrowLeft,
  AlertTriangle,
  TreePine,
  Droplets,
  Factory,
  Trash2,
} from "lucide-react"
import Link from "next/link"

export default function ReportIssuePage() {
  const [issueTitle, setIssueTitle] = useState("")
  const [issueLocation, setIssueLocation] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [issueCategory, setIssueCategory] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleSubmitReport = () => {
    console.log("[v0] Submitting report:", {
      issueTitle,
      issueLocation,
      issueDescription,
      issueCategory,
      uploadedFiles,
    })
    // Reset form
    setIssueTitle("")
    setIssueLocation("")
    setIssueDescription("")
    setIssueCategory("")
    setUploadedFiles([])
    alert("Report submitted successfully! You earned +10 XP")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
    console.log("[v0] Files uploaded:", files.length)
  }

  const issueCategories = [
    { id: "pollution", label: "Water/Air Pollution", icon: Droplets, color: "text-blue-600" },
    { id: "waste", label: "Illegal Dumping", icon: Trash2, color: "text-red-600" },
    { id: "deforestation", label: "Deforestation", icon: TreePine, color: "text-green-600" },
    { id: "industrial", label: "Industrial Damage", icon: Factory, color: "text-gray-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/user">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-foreground">EcoSpace</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-2 glass rounded-full px-3 py-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">Arjun Patel</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Hero Header */}
        <div className="glass-strong rounded-3xl p-8 text-center relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">Report Environmental Issue</h1>
            <p className="text-lg text-muted-foreground">
              Help protect our environment by reporting issues you observe. Every report makes a difference!
            </p>
          </div>
        </div>

        {/* Report Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Camera className="w-6 h-6 text-orange-600" />
              Environmental Issue Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Issue Category */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Issue Category</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {issueCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setIssueCategory(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-center hover:scale-105 ${
                      issueCategory === category.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-border/30 bg-muted/30 hover:border-emerald-300"
                    }`}
                  >
                    <category.icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Issue Title *</label>
              <Input
                placeholder="Brief description of what you observed..."
                className="glass border-border/30"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Location *</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter specific location or address..."
                  className="glass border-border/30 flex-1"
                  value={issueLocation}
                  onChange={(e) => setIssueLocation(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => console.log("[v0] Get current location clicked")}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Detailed Description *</label>
              <Textarea
                placeholder="Provide detailed information about the environmental issue. Include when you observed it, severity, potential causes, and any immediate risks..."
                className="glass border-border/30 min-h-[120px]"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Photos/Evidence</label>
              <div className="border-2 border-dashed border-border/30 rounded-lg p-8 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">Upload Photos</p>
                  <p className="text-sm text-muted-foreground mb-1">Drop photos here or click to browse</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each. Multiple files supported.</p>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-emerald-700 font-medium">{uploadedFiles.length} file(s) selected</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadedFiles.map((file, index) => (
                          <span key={index} className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Reporting Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be as specific as possible with location details</li>
                <li>• Include photos if safe to do so</li>
                <li>• Report urgent issues to local authorities immediately</li>
                <li>• Your report will be reviewed within 24-48 hours</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3"
                onClick={handleSubmitReport}
                disabled={!issueTitle || !issueLocation || !issueDescription}
              >
                Submit Report (+10 XP)
              </Button>
              <Link href="/user">
                <Button variant="outline" className="px-8 py-3 bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
