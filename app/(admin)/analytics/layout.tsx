import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("analytics.view");
  await requireFeatureEnabled("analytics");

  return children;
}