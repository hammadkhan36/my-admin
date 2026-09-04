import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function CouponsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("coupons");
  await requirePermission("coupons.view");

  return children;
}