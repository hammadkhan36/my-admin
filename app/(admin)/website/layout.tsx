import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("pages.view");
  await requireFeatureEnabled("pages");

  return children;
}