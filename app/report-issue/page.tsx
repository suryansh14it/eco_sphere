"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
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
  Loader2,
  CheckCircle,
  XCircle,
  Star,
  MapPinIcon,
} from "lucide-react"
import Link from "next/link"

interface LocationData {
  formatted: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  severity: number;
  confidence: number;
  environmentalImpact: {
    type: string;
    description: string;
  };
  recommendedXP: number;
  shouldEscalate: boolean;
  feedback: string;
  suggestions: string[];
}

export default function ReportIssuePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [issueTitle, setIssueTitle] = useState("")
  const [issueLocation, setIssueLocation] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [issueCategory, setIssueCategory] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-green-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get current location using browser geolocation
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates using OpenCage
      const response = await fetch('/api/location/reverse-geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latitude, longitude })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLocationData(data.location);
          setIssueLocation(data.location.formatted);
          toast({
            title: "Location detected",
            description: "Your current location has been filled in",
            variant: "default"
          });
        }
      }
      
    } catch (error: any) {
      console.error("Error getting location:", error);
      toast({
        title: "Location Error",
        description: error.message || "Could not get your location. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', issueTitle);
      formData.append('description', issueDescription);
      formData.append('category', issueCategory);
      formData.append('location', issueLocation);
      
      if (locationData) {
        formData.append('latitude', locationData.coordinates.latitude.toString());
        formData.append('longitude', locationData.coordinates.longitude.toString());
      }
      
      // Add images
      uploadedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/environmental-issue/submit', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setValidationResult(result.validation);
        setShowResults(true);
        
        toast({
          title: "Report Submitted!",
          description: `You earned ${result.xpAwarded} XP for your report`,
          variant: "default"
        });

        // Ensure dashboard/user context reflects new XP & level
        try {
          await refreshUser();
        } catch {}
      } else {
        throw new Error(result.message || 'Failed to submit report');
      }
      
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIssueTitle("");
    setIssueLocation("");
    setIssueDescription("");
    setIssueCategory("");
    setUploadedFiles([]);
    setLocationData(null);
    setValidationResult(null);
    setShowResults(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

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
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
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
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {locationData && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">
                      GPS Location: {locationData.coordinates.latitude.toFixed(6)}, {locationData.coordinates.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
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

            {/* Validation Results */}
            {showResults && validationResult && (
              <div className={`border-2 rounded-lg p-6 ${
                validationResult.isValid 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-amber-200 bg-amber-50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-amber-600" />
                  )}
                  <div>
                    <h3 className={`font-bold text-lg ${
                      validationResult.isValid ? 'text-green-800' : 'text-amber-800'
                    }`}>
                      {validationResult.isValid ? 'Report Validated!' : 'Report Needs Review'}
                    </h3>
                    <p className={`text-sm ${
                      validationResult.isValid ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {validationResult.feedback}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Severity</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {validationResult.severity}/10
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Confidence</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {validationResult.confidence}/10
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium">XP Earned</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      +{validationResult.recommendedXP}
                    </div>
                  </div>
                </div>
                
                {validationResult.environmentalImpact && (
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    <h4 className="font-medium mb-1">Environmental Impact</h4>
                    <p className="text-sm text-gray-700">
                      <strong>Type:</strong> {validationResult.environmentalImpact.type}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Description:</strong> {validationResult.environmentalImpact.description}
                    </p>
                  </div>
                )}
                
                {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Suggestions for Future Reports:</h4>
                    <ul className="text-sm space-y-1">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validationResult.shouldEscalate && (
                  <div className="bg-blue-100 border border-blue-300 rounded p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        This issue has been flagged for researcher attention
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={resetForm}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Report Another Issue
                  </Button>
                  <Link href="/user" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Additional Information */}
            {!showResults && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Reporting Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Be as specific as possible with location details</li>
                  <li>• Include photos if safe to do so</li>
                  <li>• Report urgent issues to local authorities immediately</li>
                  <li>• Your report will be reviewed using AI validation</li>
                  <li>• High-quality reports earn more XP (10-50 points)</li>
                </ul>
              </div>
            )}

            {/* Submit Button */}
            {!showResults && (
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3"
                  onClick={handleSubmitReport}
                  disabled={!issueTitle || !issueLocation || !issueDescription || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyzing Report...
                    </>
                  ) : (
                    'Submit Report (AI Validation)'
                  )}
                </Button>
                <Link href="/user">
                  <Button variant="outline" className="px-8 py-3 bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
