"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";

function numberOrZero(value: FormDataEntryValue | null) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export async function createMediaItem(formData: FormData) {
  await requirePermission("media.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const title = String(formData.get("title") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("image_url") || "").trim();
  const altText = String(formData.get("alt_text") || "").trim() || null;
  const category = String(formData.get("category") || "gallery").trim();
  const sortOrder = numberOrZero(formData.get("sort_order"));
  const isFeatured = formData.get("is_featured") === "on";

  if (!imageUrl) {
    throw new Error("Image URL is required.");
  }

  const { data, error } = await supabase
    .from("media_items")
    .insert({
      title,
      description,
      image_url: imageUrl,
      alt_text: altText,
      category,
      sort_order: sortOrder,
      is_featured: isFeatured,
      created_by: profile.id,
    })
    .select("id, title, image_url")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "media.created",
    targetType: "media",
    targetId: data.id,
    details: { title: data.title || data.image_url },
  });

  revalidatePath("/website/media");
  revalidatePath("/reputation/gallery");
}

export async function updateMediaItem(formData: FormData) {
  await requirePermission("media.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("image_url") || "").trim();
  const altText = String(formData.get("alt_text") || "").trim() || null;
  const category = String(formData.get("category") || "gallery").trim();
  const sortOrder = numberOrZero(formData.get("sort_order"));
  const isFeatured = formData.get("is_featured") === "on";
  const isActive = formData.get("is_active") === "on";

  if (!id || !imageUrl) {
    throw new Error("Media id and image URL are required.");
  }

  const { error } = await supabase
    .from("media_items")
    .update({
      title,
      description,
      image_url: imageUrl,
      alt_text: altText,
      category,
      sort_order: sortOrder,
      is_featured: isFeatured,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "media.updated",
    targetType: "media",
    targetId: id,
    details: { title: title || imageUrl },
  });

  revalidatePath("/website/media");
  revalidatePath("/reputation/gallery");
}

export async function deleteMediaItem(formData: FormData) {
  await requirePermission("media.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "Media item");

  const { error } = await supabase.from("media_items").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "media.deleted",
    targetType: "media",
    targetId: id,
    details: { title },
  });

  revalidatePath("/website/media");
  revalidatePath("/reputation/gallery");
}