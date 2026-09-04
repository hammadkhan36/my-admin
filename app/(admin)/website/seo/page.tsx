import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import {
  SeoSettingsForm,
  type SeoSettingsRow,
} from "@/components/website/seo-settings-form";

export default async function WebsiteSeoPage() {
  await requirePermission("seo.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seo_settings")
    .select(
      "id, default_meta_title, default_meta_description, default_keywords, og_image_url, enable_local_business_schema, enable_faq_schema, enable_review_schema, google_analytics_id, google_search_console_verification"
    )
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return <SeoSettingsForm settings={(data ?? null) as SeoSettingsRow | null} />;
}