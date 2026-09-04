import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("services");
  await requirePermission("services.view");

  return children;
}