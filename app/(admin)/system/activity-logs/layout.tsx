import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function ActivityLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("activityLogs.view");
  await requireFeatureEnabled("activityLogs");

  return children;
}