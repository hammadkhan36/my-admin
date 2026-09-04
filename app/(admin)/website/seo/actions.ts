"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "../../../../lib/auth/server";
// import { createClient } from "@/components";
import { createClient } from "../../../../lib/supabase-server";
import { logActivity } from "../../../../lib/activity-log";

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

export async function updateSeoSettings(formData: FormData) {
  await requirePermission("seo.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const defaultMetaTitle = textOrNull(formData.get("default_meta_title"));
  const defaultMetaDescription = textOrNull(formData.get("default_meta_description"));
  const defaultKeywords = textOrNull(formData.get("default_keywords"));
  const ogImageUrl = textOrNull(formData.get("og_image_url"));
  const googleAnalyticsId = textOrNull(formData.get("google_analytics_id"));
  const googleSearchConsoleVerification = textOrNull(
    formData.get("google_search_console_verification")
  );

  const payload = {
    default_meta_title: defaultMetaTitle,
    default_meta_description: defaultMetaDescription,
    default_keywords: defaultKeywords,
    og_image_url: ogImageUrl,
    enable_local_business_schema:
      formData.get("enable_local_business_schema") === "on",
    enable_faq_schema: formData.get("enable_faq_schema") === "on",
    enable_review_schema: formData.get("enable_review_schema") === "on",
    google_analytics_id: googleAnalyticsId,
    google_search_console_verification: googleSearchConsoleVerification,
  };

  const query = id
    ? supabase.from("seo_settings").update(payload).eq("id", id)
    : supabase.from("seo_settings").insert(payload);

  const { error } = await query;

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "seo_settings.updated",
    targetType: "seo_settings",
    targetId: id || null,
    details: { title: defaultMetaTitle },
  });

  revalidatePath("/website/seo");
}