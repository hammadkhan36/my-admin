import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("offers");
  await requirePermission("offers.view");

  return children;
}