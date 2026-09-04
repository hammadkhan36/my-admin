import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { PagesManager, type WebsitePageRow } from "@/components/website/pages-manager";

export default async function WebsitePagesPage() {
  await requirePermission("pages.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("website_pages")
    .select(
      `
      id,
      slug,
      title,
      meta_title,
      meta_description,
      is_active,
      created_at,
      website_content_blocks (
        id,
        page_id,
        block_key,
        block_type,
        title,
        subtitle,
        body,
        image_url,
        cta_label,
        cta_url,
        sort_order,
        is_active
      )
    `
    )
    .order("created_at", { ascending: false })
    .order("sort_order", {
      foreignTable: "website_content_blocks",
      ascending: true,
    });

  if (error) throw new Error(error.message);

  return <PagesManager pages={(data ?? []) as WebsitePageRow[]} />;
}