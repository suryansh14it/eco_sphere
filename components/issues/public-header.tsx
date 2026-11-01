"use client";

import Link from "next/link";
import { Leaf, Plus, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

export function PublicHeader() {
  const { user, logout } = useAuth();

  const dashboardHref =
    user?.role === "government"
      ? "/government"
      : user?.role === "ngo"
        ? "/ngo"
        : user
          ? "/user"
          : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-serif text-lg font-semibold text-emerald-900">
            EcoSphere
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/issues">
            <Button variant="ghost" size="sm" className="text-emerald-800">
              Issue Board
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-emerald-800">
              Volunteer
            </Button>
          </Link>
          <Link href="/report-issue">
            <Button variant="ghost" size="sm" className="text-emerald-800">
              <Plus className="mr-1 h-4 w-4" />
              Report
            </Button>
          </Link>
          <Link href={dashboardHref}>
            <Button variant="ghost" size="sm" className="text-emerald-800">
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-stone-600 sm:inline">
                {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut className="mr-1 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Join
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
