import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("staff");
  await requirePermission("staff.view");

  return children;
}