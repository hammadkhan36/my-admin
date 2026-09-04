"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function numberOrFive(value: FormDataEntryValue | null) {
  const number = Number(value || 5);
  if (!Number.isFinite(number)) return 5;
  return Math.min(5, Math.max(1, number));
}

export async function createReview(formData: FormData) {
  await requirePermission("reviews.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const customerName = String(formData.get("customer_name") || "").trim();
  const customerPhone = textOrNull(formData.get("customer_phone"));
  const customerEmail = textOrNull(formData.get("customer_email"));
  const rating = numberOrFive(formData.get("rating"));
  const title = textOrNull(formData.get("title"));
  const comment = String(formData.get("comment") || "").trim();
  const status = String(formData.get("status") || "approved");
  const isFeatured = formData.get("is_featured") === "on";

  if (!customerName || !comment) {
    throw new Error("Customer name and review comment are required.");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      rating,
      title,
      comment,
      status,
      is_featured: isFeatured,
      source: "manual",
      created_by: profile.id,
    })
    .select("id, customer_name")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "review.created",
    targetType: "review",
    targetId: data.id,
    details: { customer_name: data.customer_name, rating },
  });

  revalidatePath("/reputation/reviews");
}

export async function updateReviewStatus(formData: FormData) {
  await requirePermission("reviews.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !status) {
    throw new Error("Review id and status are required.");
  }

  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "review.status_updated",
    targetType: "review",
    targetId: id,
    details: { status },
  });

  revalidatePath("/reputation/reviews");
}

export async function updateReviewFeatured(formData: FormData) {
  await requirePermission("reviews.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const isFeatured = String(formData.get("is_featured")) === "true";

  if (!id) {
    throw new Error("Review id is required.");
  }

  const { error } = await supabase
    .from("reviews")
    .update({ is_featured: !isFeatured })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "review.featured_updated",
    targetType: "review",
    targetId: id,
    details: { featured: !isFeatured },
  });

  revalidatePath("/reputation/reviews");
}

export async function deleteReview(formData: FormData) {
  await requirePermission("reviews.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const customerName = String(formData.get("customer_name") || "Customer");

  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "review.deleted",
    targetType: "review",
    targetId: id,
    details: { customer_name: customerName },
  });

  revalidatePath("/reputation/reviews");
}