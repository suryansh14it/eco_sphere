"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Leaf, Shield, BarChart3, Users, TreePine, ArrowRight, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const roles = [
    {
      id: "government",
      name: "Government Official",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      description: "Policy & funding management",
      route: "/government",
    },
    {
      id: "researcher",
      name: "Researcher",
      icon: BarChart3,
      color: "from-teal-500 to-emerald-500",
      description: "Data analysis & insights",
      route: "/researcher",
    },
    {
      id: "user",
      name: "Community Member",
      icon: TreePine,
      color: "from-emerald-500 to-green-500",
      description: "Engage & participate",
      route: "/user",
    },
    {
      id: "ngo",
      name: "NGO / Organization",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      description: "Advocacy & coordination",
      route: "/ngo",
    },
  ]

  const handleLogin = () => {
    if (selectedRole && email && password) {
      const role = roles.find((r) => r.id === selectedRole)
      if (role) {
        window.location.href = role.route
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue your environmental impact</p>
        </div>

        {/* Login Form */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Select Your Role</label>
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

            {/* Email Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass border-border/30"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border/30" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="#" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={handleLogin}
              disabled={!selectedRole || !email || !password}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Role Benefits */}
        {selectedRole && (
          <Card className="glass mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const role = roles.find((r) => r.id === selectedRole)
                  if (!role) return null
                  return (
                    <>
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}
                      >
                        <role.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{role.name} Dashboard</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
