import { requirePermission } from "@/lib/auth/server";

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("notifications.view");

  return children;
}