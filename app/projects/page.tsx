import Link from "next/link";
import { ProjectFeed } from "@/components/projects/project-feed";
import { PublicHeader } from "@/components/issues/public-header";

export const metadata = {
  title: "Volunteer Projects - EcoSphere",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/issues"
            className="rounded-full border border-purple-200 bg-white px-4 py-1.5 font-medium text-emerald-800 hover:bg-emerald-50"
          >
            Issue board
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-emerald-200 bg-emerald-600 px-4 py-1.5 font-medium text-white"
          >
            Volunteer projects
          </Link>
        </nav>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <ProjectFeed mode="public" />
      </main>
    </div>
  );
}
