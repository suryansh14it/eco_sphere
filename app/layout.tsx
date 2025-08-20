import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { PageTransitionProvider } from "@/components/page-transition-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "EcoSphere - Environmental Collaboration Platform",
  description: "Multi-dashboard platform connecting governments, researchers, users, and NGOs for environmental action",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} antialiased`}>
      <body className="font-sans">
        {/* Load model-viewer web component for 3D models */}
        <Script
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
          type="module"
          strategy="beforeInteractive"
        />
        <AuthProvider>
          <PageTransitionProvider>{children}</PageTransitionProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
