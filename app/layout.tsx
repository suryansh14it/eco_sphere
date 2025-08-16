import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { PageTransitionProvider } from "@/components/page-transition-provider"

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
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  )
}
