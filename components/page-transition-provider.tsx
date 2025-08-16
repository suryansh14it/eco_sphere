"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LogoAnimation } from "./logo-animation"

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    if (isInitialLoad) {
      setIsAnimating(true)
      setIsInitialLoad(false)
      return
    }

    setIsAnimating(true)
  }, [pathname, isInitialLoad])

  const handleAnimationComplete = () => {
    setIsAnimating(false)
  }

  return (
    <>
      <LogoAnimation isVisible={isAnimating} onComplete={handleAnimationComplete} />
      <div className={`transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>{children}</div>
    </>
  )
}
