







import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { MediaManager, type MediaRow } from "@/components/website/media-manager";

export default async function WebsiteMediaPage() {
  await requirePermission("media.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media_items")
    .select(
      "id, title, description, image_url, alt_text, category, is_featured, is_active, sort_order, created_at"
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <MediaManager
      items={(data ?? []) as MediaRow[]}
      title="Media"
      description="Manage all website images and media items."
    />
  );
}