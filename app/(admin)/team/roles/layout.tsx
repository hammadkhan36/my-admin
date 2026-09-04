import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("roles");
  await requirePermission("roles.view");

  return children;
}