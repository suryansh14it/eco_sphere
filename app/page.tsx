"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Globe, Leaf, Droplets, TreePine, Sparkles, TrendingUp } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

// Allow using the <model-viewer> custom element in TSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any
    }
  }
}

// Client-only wrapper for the custom element to avoid SSR hydration mismatch
const ModelViewer = (props: any) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (React.createElement as any)("model-viewer", props)
}

const useCountUp = (end: number, duration = 1000, delay = 0) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        setCount(Math.floor(progress * end))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [end, duration, delay])

  return count
}

const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    const elements = document.querySelectorAll(".scroll-reveal")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, loading } = useAuth()
  
  const treesCount = useCountUp(1200000, 400, 0)
  const waterCount = useCountUp(500000, 300, 100)
  const countriesCount = useCountUp(45, 250, 200)
  const activeProjects = useCountUp(150, 1000, 0)
  const collaborators = useCountUp(25000, 1200, 200)
  const co2Reduced = useCountUp(2500000, 1500, 400)

  useScrollReveal()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const createParticle = () => {
      const particles = ["leaf", "droplet", "pollen"]
      const particle = document.createElement("div")
      particle.className = `particle ${particles[Math.floor(Math.random() * particles.length)]}`
      particle.style.left = Math.random() * 100 + "%"
      particle.style.animationDuration = Math.random() * 10 + 10 + "s"
      particle.style.animationDelay = Math.random() * 5 + "s"

      const container = document.querySelector(".floating-particles")
      if (container) {
        container.appendChild(particle)
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        }, 20000)
      }
    }

    const interval = setInterval(createParticle, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen nature-bg">
      <div className="floating-particles" />

      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass-strong forest-shadow backdrop-blur-xl" : "glass backdrop-blur-sm"
        } border-b border-stone-200/40`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-blue-500 flex items-center justify-center forest-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-stone-800">EcoSphere</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#home"
                className="text-stone-700 hover:text-green-600 transition-all duration-200 hover:scale-105 font-medium"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-stone-700 hover:text-green-600 transition-all duration-200 hover:scale-105 font-medium"
              >
                About
              </a>
              <a
                href="#impact"
                className="text-stone-700 hover:text-green-600 transition-all duration-200 hover:scale-105 font-medium"
              >
                Impact
              </a>
              <a
                href="#features"
                className="text-stone-700 hover:text-green-600 transition-all duration-200 hover:scale-105 font-medium"
              >
                Features
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-green-400 transition-all duration-200 text-stone-700 hover:text-green-700"
                asChild
              >
                <a href="/login">Login</a>
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200 forest-shadow text-white"
                asChild
              >
                <a href="/signup">
                  Sign Up
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section
        id="home"
        className="relative py-16 lg:py-28 overflow-hidden floating-leaves bg-cover bg-center"
        style={{ backgroundImage: `url('/landing page background.png')` }}
  >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <div className="glass-strong rounded-3xl p-8 lg:p-12 hover-lift pulse-glow backdrop-blur-sm">
                <Badge className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 hover:from-green-200 hover:to-blue-200 transition-all duration-300 border-green-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Connecting Environmental Action
                </Badge>
                <h1 className="font-bold text-4xl lg:text-6xl text-stone-800 mb-6 leading-tight">
                  Unite for Our Planet's
                  <span className="gradient-text"> Future</span>
                </h1>
                <p className="text-lg lg:text-xl text-stone-700 mb-8 max-w-2xl leading-relaxed">
                  Empowering governments, researchers, communities, and NGOs to collaborate on environmental solutions
                  through data-driven insights and unified action.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 hover:shadow-xl hover:scale-105 transition-all duration-300 text-white forest-shadow w-full sm:w-auto"
                    asChild
                  >
                    <a href="/signup">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div suppressHydrationWarning className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[480px] lg:h-[480px] rounded-full flex items-center justify-center">
                <ModelViewer
                  src="/Earth/source/earth-cartoon.glb"
                  alt="Rotating Earth model"
                  camera-controls
                  auto-rotate
                  rotation-per-second="30deg"
                  shadow-intensity="0.8"
                  exposure="1"
                  disable-zoom
                  style={{ width: "100%", height: "100%", background: "transparent" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 relative scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="interactive-card glass p-6 text-center group hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-stone-800 mb-2 group-hover:text-green-600 transition-colors duration-300">
                {activeProjects}+
              </div>
              <div className="text-stone-600">Active Projects</div>
            </Card>

            <Card className="interactive-card glass p-6 text-center group hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-stone-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {collaborators >= 1000 ? `${Math.floor(collaborators / 1000)}K` : collaborators}+
              </div>
              <div className="text-stone-600">Collaborators</div>
            </Card>

            <Card className="interactive-card glass p-6 text-center group hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-stone-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                {co2Reduced >= 1000000 ? `${(co2Reduced / 1000000).toFixed(1)}M` : `${Math.floor(co2Reduced / 1000)}K`}{" "}
                tons
              </div>
              <div className="text-stone-600">CO₂ Reduced</div>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="impact"
        className="py-20 ocean-bg parallax-section relative overflow-hidden scroll-reveal"
        style={{
          backgroundImage: `url('/serene-ocean-surface.png')`,
        }}
      >
        <div className="water-ripples">
          <div className="ripple" />
          <div className="ripple" />
          <div className="ripple" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 via-emerald-600/80 to-blue-500/80" />
        <div className="absolute inset-0 bg-stone-800/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(22,163,74,0.15),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-3xl lg:text-4xl text-white mb-6 drop-shadow-lg">
            Making Real Environmental Impact
          </h2>
          <p className="text-xl text-white/95 mb-12 max-w-3xl mx-auto drop-shadow-md">
            Through collaborative action and data-driven decisions, we're creating measurable change for our planet's
            future.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-strong bg-green-700/40 backdrop-blur-md p-6 rounded-2xl hover-lift group border border-white/20">
              <TreePine className="w-8 h-8 text-green-100 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
              <div className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                {treesCount >= 1000000
                  ? `${(treesCount / 1000000).toFixed(1)}M`
                  : treesCount >= 1000
                    ? `${Math.floor(treesCount / 1000)}K`
                    : treesCount.toLocaleString()}{" "}
                Trees
              </div>
              <div className="text-green-50 drop-shadow-sm">Planted & Protected</div>
            </div>

            <div className="glass-strong bg-blue-700/40 backdrop-blur-md p-6 rounded-2xl hover-lift group border border-white/20">
              <Droplets className="w-8 h-8 text-blue-100 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
              <div className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                {waterCount >= 1000 ? `${Math.floor(waterCount / 1000)}K` : waterCount.toLocaleString()} Liters
              </div>
              <div className="text-blue-50 drop-shadow-sm">Water Conserved</div>
            </div>

            <div className="glass-strong bg-emerald-700/40 backdrop-blur-md p-6 rounded-2xl hover-lift group border border-white/20">
              <Globe className="w-8 h-8 text-emerald-100 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
              <div className="text-2xl font-bold text-white mb-2 drop-shadow-md">{countriesCount} Countries</div>
              <div className="text-emerald-50 drop-shadow-sm">Active Collaboration</div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-20 scroll-reveal parallax-section"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('/blurred-forest-background.png')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-3xl lg:text-4xl text-stone-800 mb-6">Collaborative Environmental Action</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Empowering different stakeholders with specialized tools and unified data for maximum environmental
              impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="interactive-card glass p-6 group hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-stone-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                Government Portal
              </h3>
              <p className="text-stone-600 mb-4 text-sm">
                Policy tracking, resource allocation, and inter-agency coordination for environmental initiatives.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent text-blue-600"
                asChild
              >
                <a href="/signup">Explore Dashboard</a>
              </Button>
            </Card>

            <Card className="interactive-card glass p-6 group hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4 group-hover:from-teal-200 group-hover:to-teal-300 transition-all duration-300">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-lg text-stone-800 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                Research Hub
              </h3>
              <p className="text-stone-600 mb-4 text-sm">
                Data analysis tools, research collaboration, and scientific publication sharing platform.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 bg-transparent text-teal-600"
                asChild
              >
                <a href="/signup">View Research Tools</a>
              </Button>
            </Card>

            <Card className="interactive-card glass p-6 group hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-4 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-stone-800 mb-2 group-hover:text-green-600 transition-colors duration-300">
                Community Space
              </h3>
              <p className="text-stone-600 mb-4 text-sm">
                Citizen reporting, local project participation, and environmental education resources.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300 bg-transparent text-green-600"
                asChild
              >
                <a href="/signup">Join Community</a>
              </Button>
            </Card>

            <Card className="interactive-card glass p-6 group hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                <TreePine className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg text-stone-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                NGO Platform
              </h3>
              <p className="text-stone-600 mb-4 text-sm">
                Project management, volunteer coordination, and impact measurement for environmental organizations.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 bg-transparent text-emerald-600"
                asChild
              >
                <a href="/signup">Access NGO Tools</a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-bold text-3xl lg:text-4xl text-stone-800 mb-8">About EcoSphere</h2>
            <div className="max-w-4xl mx-auto">
              <Card className="glass p-8 lg:p-12 hover-lift">
                <p className="text-lg text-stone-600 leading-relaxed">
                  EcoSphere is a collaborative digital platform designed to unite governments, NGOs, researchers,
                  communities, and students in driving climate action, marine conservation, and biodiversity protection.
                  The app enables real-time data sharing, project collaboration, and citizen engagement through
                  interactive dashboards, crowdsourced reporting, and educational resources. With tools for tracking
                  sustainability metrics and integrating open environmental data, EcoSphere empowers users to co-create
                  impactful solutions for a healthier planet.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 glass-strong border-t border-stone-200/40 forest-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-blue-500 flex items-center justify-center forest-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-stone-800">EcoSphere</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-stone-600">
              <a href="/privacy" className="hover:text-green-600 transition-all duration-200 hover:scale-105">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-green-600 transition-all duration-200 hover:scale-105">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-green-600 transition-all duration-200 hover:scale-105">
                Contact
              </a>
            </div>

            <div className="text-sm text-stone-600 mt-4 md:mt-0">© 2024 EcoSphere. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
