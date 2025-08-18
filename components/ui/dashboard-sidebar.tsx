"use client"

import { useState } from 'react'
import { 
  User, 
  Leaf, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Camera, 
  Calendar, 
  Users,
  Settings,
  LucideIcon,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarTabProps {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
  badge?: number | string
}

const SidebarTab = ({ icon: Icon, label, active, onClick, badge }: SidebarTabProps) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-emerald-100/50",
        active ? "bg-emerald-100 text-emerald-700" : "text-foreground/70"
      )}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-grow font-medium text-sm">{label}</span>
      {badge && (
        <span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
          {badge}
        </span>
      )}
      {active && <ChevronRight className="w-4 h-4 text-emerald-600" />}
    </div>
  )
}

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  translations: Record<string, string>
}

export default function DashboardSidebar({ activeTab, onTabChange, translations }: DashboardSidebarProps) {
  const tabs = [
    { 
      id: 'overview',
      icon: Leaf, 
      label: translations.overview || 'Overview',
    },
    { 
      id: 'education',
      icon: BookOpen, 
      label: translations.education || 'Education', 
    },
    { 
      id: 'achievements',
      icon: Award, 
      label: translations.achievements || 'Achievements',
    },
    { 
      id: 'impact',
      icon: TrendingUp, 
      label: translations.impact || 'My Impact', 
    },
    { 
      id: 'reports',
      icon: Camera, 
      label: translations.reports || 'My Reports',
      badge: '3'
    },
    { 
      id: 'events',
      icon: Calendar, 
      label: translations.events || 'Events', 
    },
    { 
      id: 'community',
      icon: Users, 
      label: translations.community || 'Community', 
    }
  ]
  
  return (
    <div className="glass h-full p-4 rounded-xl">
      <div className="mb-6 text-sm font-medium text-muted-foreground">
        {translations.dashboardMenu || 'Dashboard Menu'}
      </div>
      
      <div className="space-y-1">
        {tabs.map((tab) => (
          <SidebarTab
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            badge={tab.badge}
          />
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-muted">
        <SidebarTab
          icon={Settings}
          label={translations.settings || 'Settings'}
          active={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />
      </div>
    </div>
  )
}
