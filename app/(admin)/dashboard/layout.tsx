import { requirePermission } from "@/lib/auth/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("dashboard.view");

  return children;
}