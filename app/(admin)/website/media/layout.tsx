import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("media");
  await requirePermission("media.view");

  return children;
}