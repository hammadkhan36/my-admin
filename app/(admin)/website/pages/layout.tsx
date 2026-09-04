import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("pages");
  await requirePermission("pages.view");

  return children;
}