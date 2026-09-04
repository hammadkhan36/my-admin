import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("services.view");
  await requireFeatureEnabled("services");

  return children;
}