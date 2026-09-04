import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("faqs");
  await requirePermission("faqs.view");

  return children;
}