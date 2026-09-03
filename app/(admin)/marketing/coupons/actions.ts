"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function numberOrNull(value: FormDataEntryValue | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function numberOrZero(value: FormDataEntryValue | null) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

export async function createCoupon(formData: FormData) {
  await requirePermission("coupons.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const code = normalizeCode(String(formData.get("code") || ""));
  const title = String(formData.get("title") || "").trim();
  const description = textOrNull(formData.get("description"));
  const discountType = String(formData.get("discount_type") || "percent");
  const discountValue = numberOrZero(formData.get("discount_value"));
  const startsAt = textOrNull(formData.get("starts_at"));
  const endsAt = textOrNull(formData.get("ends_at"));
  const usageLimit = numberOrNull(formData.get("usage_limit"));

  if (!code || !title) {
    throw new Error("Coupon code and title are required.");
  }

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code,
      title,
      description,
      discount_type: discountType,
      discount_value: discountValue,
      starts_at: startsAt,
      ends_at: endsAt,
      usage_limit: usageLimit,
      created_by: profile.id,
    })
    .select("id, code")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "coupon.created",
    targetType: "coupon",
    targetId: data.id,
    details: { code: data.code },
  });

  revalidatePath("/marketing/coupons");
}

export async function updateCoupon(formData: FormData) {
  await requirePermission("coupons.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const code = normalizeCode(String(formData.get("code") || ""));
  const title = String(formData.get("title") || "").trim();
  const description = textOrNull(formData.get("description"));
  const discountType = String(formData.get("discount_type") || "percent");
  const discountValue = numberOrZero(formData.get("discount_value"));
  const startsAt = textOrNull(formData.get("starts_at"));
  const endsAt = textOrNull(formData.get("ends_at"));
  const usageLimit = numberOrNull(formData.get("usage_limit"));
  const isActive = formData.get("is_active") === "on";

  if (!id || !code || !title) {
    throw new Error("Coupon id, code and title are required.");
  }

  const { error } = await supabase
    .from("coupons")
    .update({
      code,
      title,
      description,
      discount_type: discountType,
      discount_value: discountValue,
      starts_at: startsAt,
      ends_at: endsAt,
      usage_limit: usageLimit,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "coupon.updated",
    targetType: "coupon",
    targetId: id,
    details: { code },
  });

  revalidatePath("/marketing/coupons");
}

export async function deleteCoupon(formData: FormData) {
  await requirePermission("coupons.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const code = String(formData.get("code") || "Coupon");

  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "coupon.deleted",
    targetType: "coupon",
    targetId: id,
    details: { code },
  });

  revalidatePath("/marketing/coupons");
}