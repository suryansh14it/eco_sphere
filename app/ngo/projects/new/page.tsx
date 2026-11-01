import { Suspense } from "react";
import { CreateProjectView } from "./create-view";

export const metadata = {
  title: "Start a Project - EcoSphere NGO",
};

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <Suspense fallback={null}>
        <CreateProjectView />
      </Suspense>
    </div>
  );
}
