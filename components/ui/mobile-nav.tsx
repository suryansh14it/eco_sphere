"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import DashboardSidebar from "./dashboard-sidebar"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  translations: Record<string, string>
}

export function MobileNav({ activeTab, onTabChange, translations }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pt-10 w-72">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            onTabChange(tab)
          }}
          translations={translations}
        />
      </SheetContent>
    </Sheet>
  )
}
