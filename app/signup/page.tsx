"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Leaf, Shield, BarChart3, Users, TreePine, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const roles = [
    {
      id: "government",
      name: "Government Official",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      description: "Policy & funding management",
      fields: ["Department", "Position", "Government ID"],
    },
    {
      id: "researcher",
      name: "Researcher",
      icon: BarChart3,
      color: "from-teal-500 to-emerald-500",
      description: "Data analysis & insights",
      fields: ["Institution", "Research Area", "Academic Credentials"],
    },
    {
      id: "user",
      name: "Community Member",
      icon: TreePine,
      color: "from-emerald-500 to-green-500",
      description: "Engage & participate",
      fields: ["Location", "Interests"],
    },
    {
      id: "ngo",
      name: "NGO / Organization",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      description: "Advocacy & coordination",
      fields: ["Organization Name", "Registration Number", "Focus Areas"],
    },
  ]

  const handleSignup = () => {
    if (selectedRole) {
      // In a real app, this would handle the signup process
      window.location.href = "/login"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-foreground mb-2">Join EcoSphere</h1>
          <p className="text-muted-foreground">Create your account and start making environmental impact</p>
        </div>

        {/* Signup Form */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Choose Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/10"
                        : "border-border/30 bg-muted/20 hover:border-border/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-2`}
                    >
                      <role.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm font-medium text-foreground">{role.name}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedRole && (
              <>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                    <Input placeholder="Enter first name" className="glass border-border/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                    <Input placeholder="Enter last name" className="glass border-border/30" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                  <Input type="email" placeholder="Enter your email" className="glass border-border/30" />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        className="glass border-border/30 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className="glass border-border/30 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role-Specific Fields */}
                <div className="border-t border-border/20 pt-6">
                  <h3 className="text-sm font-medium text-foreground mb-4">
                    {roles.find((r) => r.id === selectedRole)?.name} Information
                  </h3>

                  {selectedRole === "government" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Department</label>
                        <Select>
                          <SelectTrigger className="glass border-border/30">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="environmental">Environmental Protection</SelectItem>
                            <SelectItem value="urban">Urban Planning</SelectItem>
                            <SelectItem value="energy">Energy & Resources</SelectItem>
                            <SelectItem value="health">Public Health</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Position</label>
                        <Input placeholder="Your position/title" className="glass border-border/30" />
                      </div>
                    </div>
                  )}

                  {selectedRole === "researcher" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Institution</label>
                        <Input placeholder="University or research institution" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Research Area</label>
                        <Select>
                          <SelectTrigger className="glass border-border/30">
                            <SelectValue placeholder="Select research focus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="climate">Climate Science</SelectItem>
                            <SelectItem value="marine">Marine Biology</SelectItem>
                            <SelectItem value="ecology">Ecology & Conservation</SelectItem>
                            <SelectItem value="environmental">Environmental Engineering</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedRole === "user" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                        <Input placeholder="City, State/Country" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Environmental Interests
                        </label>
                        <Textarea
                          placeholder="What environmental causes are you passionate about?"
                          className="glass border-border/30"
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === "ngo" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Organization Name</label>
                        <Input placeholder="Your NGO/organization name" className="glass border-border/30" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Focus Areas</label>
                        <Textarea
                          placeholder="Describe your organization's environmental focus areas"
                          className="glass border-border/30"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded border-border/30" />
                  <div className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                {/* Create Account Button */}
                <Button
                  onClick={handleSignup}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {/* Sign In Link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        {selectedRole && (
          <Card className="glass mt-6">
            <CardContent className="p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
                What you'll get as a {roles.find((r) => r.id === selectedRole)?.name}:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Access to specialized dashboard",
                  "Collaboration with other stakeholders",
                  "Real-time environmental data",
                  "Impact tracking and reporting",
                  "Community networking opportunities",
                  "Educational resources and training",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
