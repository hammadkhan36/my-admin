

import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { MediaManager, type MediaRow } from "@/components/website/media-manager";

export default async function GalleryPage() {
  await requirePermission("gallery.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media_items")
    .select(
      "id, title, description, image_url, alt_text, category, is_featured, is_active, sort_order, created_at"
    )
    .eq("category", "gallery")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <MediaManager
      items={(data ?? []) as MediaRow[]}
      title="Gallery"
      description="Manage gallery images shown on the business website."
    />
  );
}