import { ProjectFeed } from "@/components/projects/project-feed";

export const metadata = {
  title: "My Projects - EcoSphere NGO",
};

export default function NgoProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <ProjectFeed mode="mine" />
      </main>
    </div>
  );
}
