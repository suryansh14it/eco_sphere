"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Shield, BarChart3, Users, TreePine, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function DashboardSelection() {
  const [selectedRole, setSelectedRole] = useState<string>("")

  const roles = [
    {
      id: "government",
      name: "Government Portal",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      description: "Central and State Government dashboard for managing Indian environmental policies, funding, and projects (e.g., Namami Gange, National Clean Air Programme)",
      features: [
        "Approve and monitor Swachh Bharat, Jal Jeevan Mission, and other schemes",
        "Allocate funding to state/UT projects",
        "Track real-time air/water quality metrics (CPCB/NAMP)",
        "Policy management and compliance (MoEFCC, CPCB)"
      ],
      route: "/government",
    },
    {
      id: "researcher",
      name: "Research Hub",
      icon: BarChart3,
      color: "from-teal-500 to-emerald-500",
      description: "Collaborate on Indian environmental research, access datasets (ISRO, CPCB, IMD), and generate SDG insights",
      features: [
        "SDG analytics for India (NITI Aayog, UN SDG India Index)",
        "Visualize air, water, and biodiversity data (IITs, IISc, NEERI)",
        "Research collaboration with Indian institutes",
        "Publish impact reports for Indian states/districts"
      ],
      route: "/researcher",
    },
    {
      id: "user",
      name: "Community Space",
      icon: TreePine,
      color: "from-emerald-500 to-green-500",
      description: "Join local Indian initiatives, track your impact, and engage with community projects (tree plantation, cleanups, water conservation)",
      features: [
        "Participate in city/district projects (e.g., Mumbai Beach Cleanup, Delhi Tree Plantation)",
        "Track personal and community impact (XP, leaderboard)",
        "Access environmental education in Hindi, Bengali, Tamil, etc.",
        "Connect with local leaders and volunteers"
      ],
      route: "/user",
    },
    {
      id: "ngo",
      name: "NGO Platform",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      description: "Coordinate campaigns, manage volunteers, and propose projects to government (e.g., WWF India, CSE, TERI)",
      features: [
        "Manage campaigns (plastic ban, river cleanups, afforestation)",
        "Volunteer coordination and training",
        "Submit proposals to government portals",
        "Collect feedback from local communities"
      ],
      route: "/ngo",
    },
  ]

  const handleRoleSelect = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role) {
      window.location.href = role.route
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-serif font-bold text-4xl text-foreground mb-4">Choose Your Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your role to access your personalized environmental collaboration dashboard
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`glass-strong cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                selectedRole === role.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-serif">{role.name}</CardTitle>
                <p className="text-muted-foreground">{role.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 text-white`}
                >
                  Access {role.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access */}
        <div className="mt-12 text-center">
          <Card className="glass max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-2">Quick Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Not sure which role fits you? Start as a Community Member and explore other roles later.
              </p>
              <Button
                onClick={() => handleRoleSelect("user")}
                variant="outline"
                className="bg-transparent border-emerald-200 hover:bg-emerald-50"
              >
                Start as Community Member
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
