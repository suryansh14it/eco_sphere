"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { toast } from '@/hooks/use-toast';

// Define custom user type with the fields we need
interface UserWithProgress {
  id: string;
  xpPoints: number;
  level: number;
  environmentalImpact: {
    treesPlanted: number;
    co2Offset: number;
    waterSaved: number;
  };
  activityHistory: Array<any>;
  completedItems: string[];
}

interface EnvironmentalImpact {
  treesPlanted?: number;
  co2Offset?: number;
  waterSaved?: number;
}

interface ActivityDetails {
  eventType: 'quiz_completion' | 'project_joined' | 'tree_planted' | 'issue_reported' | 'educational_content' | 'community_event';
  description: string;
  environmentalImpact?: EnvironmentalImpact;
  relatedItemId?: string;
  location?: string;
  participants?: number;
  organizer?: string;
  duration?: string;
  [key: string]: any; // Additional fields can be added
}

export function useUserProgress() {
  const { user: authUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    totalXp: number;
    level: number;
    xpForNextLevel: number;
    xpToNextLevel: number;
    environmentalImpact: { treesPlanted: number; co2Offset: number; waterSaved: number };
    recentActivity: any[];
  } | null>(null);
  
  // Cast user to our extended type
  const user = authUser as unknown as UserWithProgress | null;

  // Fetch minimal dashboard progress from backend route
  const refreshProgress = async () => {
    if (!authUser) return;
    try {
      const res = await fetch('/api/user/dashboard-data', { credentials: 'include' });
      if (!res.ok) {
        setDashboardData(null);
        return;
      }
      const json = await res.json();
      if (json?.success) {
        setDashboardData(json.data);
      } else {
        setDashboardData(null);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard-data:', e);
      setDashboardData(null);
    }
  };

  // Load progress on first use and when auth user changes
  useEffect(() => {
    refreshProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  // Add XP and record activity
  const addUserXP = async (
    amount: number,
    activityDetails: ActivityDetails
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          amount,
          ...activityDetails
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh user and progress data to get the latest state
        await refreshUser();
        await refreshProgress();
        
          toast({
            title: `+${amount} XP Earned!`,
            description: activityDetails.description,
            variant: 'success' as any // Cast to any to avoid type issues
          });        // Check if level up occurred
        const oldLevel = Math.floor(1 + Math.sqrt((user.xpPoints || 0) / 10));
        const newLevel = data.user.level;
        
          if (newLevel > oldLevel) {
            toast({
              title: `Level Up! 🎉`,
              description: `Congratulations! You reached level ${newLevel}`,
              variant: 'success' as any // Cast to any to avoid type issues
            });
          }        return data.user;
      } else {
        throw new Error(data.message || 'Failed to add XP');
      }
      
    } catch (error) {
      console.error('Error adding XP:', error);
      toast({
        title: 'Error',
        description: 'Failed to record your progress. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark an item as complete
  const markItemAsComplete = async (itemId: string, itemType: string, title?: string, xpAmount: number = 15) => {
    if (!user) return { success: false };
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/complete-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          itemId,
          itemType,
          title,
          xpAmount,
          environmentalImpact: {
            co2Offset: itemType === 'pdf' ? 0.3 : itemType === 'video' ? 0.5 : 0.2
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh user and progress data to get the latest state
        await refreshUser();
        await refreshProgress();
        
        if (data.isNewCompletion) {
          toast({
            title: 'Item Completed!',
            description: `+${xpAmount} XP earned`,
            variant: 'success' as any // Cast to any to avoid type issues
          });
          
          if (data.isLevelUp) {
            toast({
              title: `Level Up! 🎉`,
              description: `Congratulations! You reached level ${data.level}`,
              variant: 'success' as any // Cast to any to avoid type issues
            });
          }
        }
        
        return { 
          success: true, 
          isNewCompletion: data.isNewCompletion,
          isLevelUp: data.isLevelUp
        };
      } else {
        throw new Error(data.message || 'Failed to mark item as complete');
      }
      
    } catch (error) {
      console.error('Error marking item as complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive'
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an item is completed
  const isItemCompleted = (itemId: string): boolean => {
    if (!user || !user.completedItems) return false;
    return user.completedItems.includes(itemId);
  };
  
  // Calculate XP needed for the next level
  const calculateXpForNextLevel = (): { current: number, needed: number, percentage: number } => {
  const level = dashboardData?.level ?? user?.level;
  const totalXp = dashboardData?.totalXp ?? user?.xpPoints;
  if (!level || totalXp === undefined) return { current: 0, needed: 100, percentage: 0 };

  // Lower bound XP for current level and threshold for next level
  const lowerBound = Math.pow(level - 1, 2) * 10;
  const nextThreshold = dashboardData?.xpForNextLevel ?? Math.pow(level, 2) * 10;

  const xpProgress = Math.max(0, totalXp - lowerBound);
  const xpNeeded = Math.max(1, nextThreshold - lowerBound);
  const percentage = Math.min(100, Math.floor((xpProgress / xpNeeded) * 100));

  return { current: xpProgress, needed: xpNeeded, percentage };
  };

  return {
    addUserXP,
    markItemAsComplete,
    isItemCompleted,
    calculateXpForNextLevel,
    isLoading,
  userXp: dashboardData?.totalXp ?? user?.xpPoints ?? 0,
  userLevel: dashboardData?.level ?? user?.level ?? 1,
  userImpact: dashboardData?.environmentalImpact ?? user?.environmentalImpact ?? { treesPlanted: 0, co2Offset: 0, waterSaved: 0 },
  activityHistory: dashboardData?.recentActivity ?? user?.activityHistory ?? [],
    completedItems: user?.completedItems || []
  };
}
