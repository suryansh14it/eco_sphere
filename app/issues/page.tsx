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
      <main className="mx-auto max-w-6xl px-4 py-10">
        <IssueFeed mode="public" />
      </main>
    </div>
  );
}
