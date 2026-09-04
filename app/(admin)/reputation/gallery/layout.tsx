import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("gallery");
  await requirePermission("gallery.view");

  return children;
}