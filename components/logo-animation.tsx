"use client"

import { useEffect, useState } from "react"
import { Leaf } from "lucide-react"

interface LogoAnimationProps {
  isVisible: boolean
  onComplete?: () => void
}

export function LogoAnimation({ isVisible, onComplete }: LogoAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<"enter" | "pulse" | "exit">("enter")

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase("enter")

      // Enter phase -> Pulse phase
      const enterTimer = setTimeout(() => {
        setAnimationPhase("pulse")
      }, 800)

      // Pulse phase -> Exit phase
      const pulseTimer = setTimeout(() => {
        setAnimationPhase("exit")
      }, 1500)

      // Complete animation
      const exitTimer = setTimeout(() => {
        onComplete?.()
      }, 2200)

      return () => {
        clearTimeout(enterTimer)
        clearTimeout(pulseTimer)
        clearTimeout(exitTimer)
      }
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ${
        animationPhase === "enter"
          ? "bg-gradient-to-br from-green-50 to-blue-50 opacity-100"
          : animationPhase === "pulse"
            ? "bg-gradient-to-br from-green-50 to-blue-50 opacity-100"
            : "bg-gradient-to-br from-green-50 to-blue-50 opacity-0"
      }`}
    >
      <div
        className={`relative transition-all duration-700 ${
          animationPhase === "enter"
            ? "scale-0 rotate-180 opacity-0"
            : animationPhase === "pulse"
              ? "scale-100 rotate-0 opacity-100"
              : "scale-150 rotate-0 opacity-0"
        }`}
      >
        <div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-blue-500 flex items-center justify-center shadow-2xl transition-all duration-500 ${
            animationPhase === "pulse" ? "animate-pulse shadow-green-500/50" : ""
          }`}
        >
          <Leaf
            className={`w-10 h-10 text-white transition-all duration-500 ${
              animationPhase === "pulse" ? "animate-bounce" : ""
            }`}
          />
        </div>

        <div
          className={`absolute inset-0 rounded-2xl border-2 border-green-400 transition-all duration-1000 ${
            animationPhase === "pulse" ? "scale-150 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <div
          className={`absolute inset-0 rounded-2xl border-2 border-blue-400 transition-all duration-1000 delay-200 ${
            animationPhase === "pulse" ? "scale-200 opacity-0" : "scale-100 opacity-100"
          }`}
        />

        <div
          className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-300 ${
            animationPhase === "enter"
              ? "opacity-0 translate-y-4"
              : animationPhase === "pulse"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
          }`}
        >
          <span className="font-bold text-2xl text-stone-800">EcoSphere</span>
        </div>
      </div>
    </div>
  )
}
