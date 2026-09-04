import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("notifications.view");
  await requireFeatureEnabled("notifications");

  return children;
}