import { redirect } from "next/navigation";

/**
 * The researcher role has been retired. Verification is now a capability
 * attached to issues and projects rather than a separate dashboard.
 */
export default function ResearcherPage() {
  redirect("/issues");
}
