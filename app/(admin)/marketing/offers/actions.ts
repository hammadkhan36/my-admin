"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";
import {
  actionFailure,
  actionSuccess,
  getErrorMessage,
  type ActionState,
} from "@/lib/action-state";


function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function numberOrZero(value: FormDataEntryValue | null) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export async function createOffer(formData: FormData) {
  await requirePermission("offers.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const title = String(formData.get("title") || "").trim();
  const description = textOrNull(formData.get("description"));
  const discountLabel = textOrNull(formData.get("discount_label"));
  const startsAt = textOrNull(formData.get("starts_at"));
  const endsAt = textOrNull(formData.get("ends_at"));
  const ctaLabel = textOrNull(formData.get("cta_label"));
  const ctaUrl = textOrNull(formData.get("cta_url"));
  const imageUrl = textOrNull(formData.get("image_url"));
  const sortOrder = numberOrZero(formData.get("sort_order"));

  if (!title) {
    throw new Error("Offer title is required.");
  }

  const { data, error } = await supabase
    .from("offers")
    .insert({
      title,
      description,
      discount_label: discountLabel,
      starts_at: startsAt,
      ends_at: endsAt,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      image_url: imageUrl,
      sort_order: sortOrder,
      created_by: profile.id,
    })
    .select("id, title")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "offer.created",
    targetType: "offer",
    targetId: data.id,
    details: { title: data.title },
  });

  revalidatePath("/marketing/offers");
}

export async function updateOffer(formData: FormData) {
  await requirePermission("offers.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = textOrNull(formData.get("description"));
  const discountLabel = textOrNull(formData.get("discount_label"));
  const startsAt = textOrNull(formData.get("starts_at"));
  const endsAt = textOrNull(formData.get("ends_at"));
  const ctaLabel = textOrNull(formData.get("cta_label"));
  const ctaUrl = textOrNull(formData.get("cta_url"));
  const imageUrl = textOrNull(formData.get("image_url"));
  const sortOrder = numberOrZero(formData.get("sort_order"));
  const isActive = formData.get("is_active") === "on";

  if (!id || !title) {
    throw new Error("Offer id and title are required.");
  }

  const { error } = await supabase
    .from("offers")
    .update({
      title,
      description,
      discount_label: discountLabel,
      starts_at: startsAt,
      ends_at: endsAt,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      image_url: imageUrl,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "offer.updated",
    targetType: "offer",
    targetId: id,
    details: { title },
  });

  revalidatePath("/marketing/offers");
}

export async function deleteOffer(formData: FormData) {
  await requirePermission("offers.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "Offer");

  const { error } = await supabase.from("offers").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "offer.deleted",
    targetType: "offer",
    targetId: id,
    details: { title },
  });

  revalidatePath("/marketing/offers");
}




export async function createOfferSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await createOffer(formData);
    return actionSuccess("Offer created successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Offer could not be created."));
  }
}

export async function updateOfferSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await updateOffer(formData);
    return actionSuccess("Offer updated successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Offer could not be updated."));
  }
}

export async function deleteOfferSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await deleteOffer(formData);
    return actionSuccess("Offer deleted successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Offer could not be deleted."));
  }
}


