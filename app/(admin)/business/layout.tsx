import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("businessProfile.view");
  await requireFeatureEnabled("businessProfile");

  return children;
}