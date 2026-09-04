import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("customers.view");
  await requireFeatureEnabled("customers");
  return children;
}