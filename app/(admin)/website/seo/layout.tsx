import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("seo");
  await requirePermission("seo.view");

  return children;
}