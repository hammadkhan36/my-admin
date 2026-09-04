"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function numberOrZero(value: FormDataEntryValue | null) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createWebsitePage(formData: FormData) {
  await requirePermission("pages.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const title = String(formData.get("title") || "").trim();
  const slug = slugify(String(formData.get("slug") || title));
  const metaTitle = textOrNull(formData.get("meta_title"));
  const metaDescription = textOrNull(formData.get("meta_description"));

  if (!title || !slug) {
    throw new Error("Page title and slug are required.");
  }

  const { data, error } = await supabase
    .from("website_pages")
    .insert({
      title,
      slug,
      meta_title: metaTitle,
      meta_description: metaDescription,
      created_by: profile.id,
    })
    .select("id, title, slug")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "website_page.created",
    targetType: "website_page",
    targetId: data.id,
    details: { title: data.title, slug: data.slug },
  });

  revalidatePath("/website/pages");
}

export async function updateWebsitePage(formData: FormData) {
  await requirePermission("pages.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const slug = slugify(String(formData.get("slug") || title));
  const metaTitle = textOrNull(formData.get("meta_title"));
  const metaDescription = textOrNull(formData.get("meta_description"));
  const isActive = formData.get("is_active") === "on";

  if (!id || !title || !slug) {
    throw new Error("Page id, title and slug are required.");
  }

  const { error } = await supabase
    .from("website_pages")
    .update({
      title,
      slug,
      meta_title: metaTitle,
      meta_description: metaDescription,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "website_page.updated",
    targetType: "website_page",
    targetId: id,
    details: { title, slug },
  });

  revalidatePath("/website/pages");
}

export async function deleteWebsitePage(formData: FormData) {
  await requirePermission("pages.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "Page");

  const { error } = await supabase.from("website_pages").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "website_page.deleted",
    targetType: "website_page",
    targetId: id,
    details: { title },
  });

  revalidatePath("/website/pages");
}

export async function createContentBlock(formData: FormData) {
  await requirePermission("pages.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const pageId = String(formData.get("page_id") || "");
  const blockKey = slugify(String(formData.get("block_key") || ""));
  const blockType = String(formData.get("block_type") || "text");
  const title = textOrNull(formData.get("title"));
  const subtitle = textOrNull(formData.get("subtitle"));
  const body = textOrNull(formData.get("body"));
  const imageUrl = textOrNull(formData.get("image_url"));
  const ctaLabel = textOrNull(formData.get("cta_label"));
  const ctaUrl = textOrNull(formData.get("cta_url"));
  const sortOrder = numberOrZero(formData.get("sort_order"));

  if (!pageId || !blockKey) {
    throw new Error("Page and block key are required.");
  }

  const { data, error } = await supabase
    .from("website_content_blocks")
    .insert({
      page_id: pageId,
      block_key: blockKey,
      block_type: blockType,
      title,
      subtitle,
      body,
      image_url: imageUrl,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      sort_order: sortOrder,
    })
    .select("id, block_key")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "content_block.created",
    targetType: "content_block",
    targetId: data.id,
    details: { block_key: data.block_key },
  });

  revalidatePath("/website/pages");
}

export async function updateContentBlock(formData: FormData) {
  await requirePermission("pages.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const blockKey = slugify(String(formData.get("block_key") || ""));
  const blockType = String(formData.get("block_type") || "text");
  const title = textOrNull(formData.get("title"));
  const subtitle = textOrNull(formData.get("subtitle"));
  const body = textOrNull(formData.get("body"));
  const imageUrl = textOrNull(formData.get("image_url"));
  const ctaLabel = textOrNull(formData.get("cta_label"));
  const ctaUrl = textOrNull(formData.get("cta_url"));
  const sortOrder = numberOrZero(formData.get("sort_order"));
  const isActive = formData.get("is_active") === "on";

  if (!id || !blockKey) {
    throw new Error("Block id and key are required.");
  }

  const { error } = await supabase
    .from("website_content_blocks")
    .update({
      block_key: blockKey,
      block_type: blockType,
      title,
      subtitle,
      body,
      image_url: imageUrl,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "content_block.updated",
    targetType: "content_block",
    targetId: id,
    details: { block_key: blockKey },
  });

  revalidatePath("/website/pages");
}

export async function deleteContentBlock(formData: FormData) {
  await requirePermission("pages.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const blockKey = String(formData.get("block_key") || "Block");

  const { error } = await supabase
    .from("website_content_blocks")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "content_block.deleted",
    targetType: "content_block",
    targetId: id,
    details: { block_key: blockKey },
  });

  revalidatePath("/website/pages");
}