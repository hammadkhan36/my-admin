import { requirePermission } from "@/lib/auth/server";

export default async function ActivityLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("activityLogs.view");

  return children;
}