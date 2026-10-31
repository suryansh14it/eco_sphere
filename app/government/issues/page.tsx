import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IssueFeed } from "@/components/issues/issue-feed";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Citizen Issue Queue - EcoSphere Government",
};

export default function GovernmentIssuesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="border-b border-blue-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/government">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Government dashboard
            </Button>
          </Link>
          <span className="text-sm font-medium text-blue-900">EcoSphere · Government</span>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <IssueFeed mode="triage" />
      </main>
    </div>
  );
}
