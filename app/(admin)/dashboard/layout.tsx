import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("dashboard");
  await requirePermission("dashboard.view");

  return children;
}

