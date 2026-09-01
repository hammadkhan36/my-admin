import { requirePermission } from "@/lib/auth/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("campaigns.view");

  return children;
}