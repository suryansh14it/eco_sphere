"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'government' | 'researcher' | 'user' | 'ngo';
  isVerified: boolean;
  // Progress fields
  xpPoints?: number;
  level?: number;
  environmentalImpact?: {
    treesPlanted: number;
    co2Offset: number;
    waterSaved: number;
  };
  activityHistory?: Array<any>;
  completedItems?: string[];
  achievements?: string[];
  // Role-specific fields
  department?: string;
  position?: string;
  governmentId?: string;
  institution?: string;
  researchArea?: string;
  academicCredentials?: string;
  location?: string;
  interests?: string[];
  organizationName?: string;
  registrationNumber?: string;
  focusAreas?: string[];
  // Common fields
  phone?: string;
  profileImage?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Get redirect URL directly from the response
        if (data.redirectTo) {
          router.push(data.redirectTo);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Get redirect URL directly from the response
        if (data.redirectTo) {
          router.push(data.redirectTo);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async (): Promise<void> => {
    setLoading(true);
    console.log('Refreshing user data...');
    const updatedUser = await fetchUser();
    console.log('Updated user data:', updatedUser);
    if (updatedUser) {
      console.log('User XP after refresh:', updatedUser.xpPoints);
    }
    setLoading(false);
  };

  // Only check for existing auth when app starts, but don't show errors
  useEffect(() => {
    const checkAuth = async () => {
      const hasSession = document.cookie.includes('user_session');
      if (hasSession) {
        await fetchUser();
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
