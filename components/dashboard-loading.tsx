"use client";

import { Loader2 } from "lucide-react";

interface DashboardLoadingProps {
  message?: string;
  className?: string;
}

export function DashboardLoading({ 
  message = "Loading dashboard...", 
  className = "" 
}: DashboardLoadingProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 ${className}`}>
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 rounded-full mx-auto"></div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-purple-700">{message}</p>
          <p className="text-sm text-purple-500">Please wait while we load your data...</p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Role-specific loading components
export function NGODashboardLoading() {
  return (
    <DashboardLoading 
      message="Loading NGO Dashboard..." 
      className="bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50"
    />
  );
}

export function ResearcherDashboardLoading() {
  return (
    <DashboardLoading 
      message="Loading Researcher Dashboard..." 
      className="bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50"
    />
  );
}

export function GovernmentDashboardLoading() {
  return (
    <DashboardLoading 
      message="Loading Government Dashboard..." 
      className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    />
  );
}

export function UserDashboardLoading() {
  return (
    <DashboardLoading 
      message="Loading User Dashboard..." 
      className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
    />
  );
}
