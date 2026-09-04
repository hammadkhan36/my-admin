import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("reviews");
  await requirePermission("reviews.view");

  return children;
}