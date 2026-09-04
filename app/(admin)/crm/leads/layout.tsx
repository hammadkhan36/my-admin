import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("leads");
  await requirePermission("leads.view");

  return children;
}