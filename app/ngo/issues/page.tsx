import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IssueFeed } from "@/components/issues/issue-feed";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Community Issues - EcoSphere NGO",
};

export default function NgoIssuesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <div className="border-b border-purple-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/ngo">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              NGO dashboard
            </Button>
          </Link>
          <span className="text-sm font-medium text-purple-900">EcoSphere · NGO</span>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <IssueFeed mode="ngo" />
      </main>
    </div>
  );
}
