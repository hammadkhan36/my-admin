import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function LeadSourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("leadSources.view");
  await requireFeatureEnabled("leadSources");

  return children;
}