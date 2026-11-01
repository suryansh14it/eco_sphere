import Link from "next/link";
import { PublicHeader } from "@/components/issues/public-header";
import { IssueFeed } from "@/components/issues/issue-feed";

export const metadata = {
  title: "Public Issue Board - EcoSphere",
  description:
    "Browse environmental issues reported by citizens, verified by the community, and routed to NGOs and government departments.",
};

export default function IssuesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/issues"
            className="rounded-full border border-emerald-200 bg-emerald-600 px-4 py-1.5 font-medium text-white"
          >
            Issue board
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-emerald-200 bg-white px-4 py-1.5 font-medium text-emerald-800 hover:bg-emerald-50"
          >
            Volunteer projects
          </Link>
        </nav>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <IssueFeed mode="public" />
      </main>
    </div>
  );
}
