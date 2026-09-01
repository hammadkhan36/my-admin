import { requirePermission } from "@/lib/auth/server";

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("analytics.view");

  return children;
}