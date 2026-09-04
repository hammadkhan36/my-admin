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

function numberOrNull(value: FormDataEntryValue | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function createTestimonial(formData: FormData) {
  await requirePermission("testimonials.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const customerName = String(formData.get("customer_name") || "").trim();
  const customerRole = String(formData.get("customer_role") || "").trim() || null;
  const quote = String(formData.get("quote") || "").trim();
  const imageUrl = String(formData.get("image_url") || "").trim() || null;
  const rating = numberOrNull(formData.get("rating"));
  const sortOrder = Number(formData.get("sort_order") || 0);

  if (!customerName || !quote) {
    throw new Error("Customer name and quote are required.");
  }

  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      customer_name: customerName,
      customer_role: customerRole,
      quote,
      rating,
      image_url: imageUrl,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      created_by: profile.id,
    })
    .select("id, customer_name")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "testimonial.created",
    targetType: "testimonial",
    targetId: data.id,
    details: { customer_name: data.customer_name },
  });

  revalidatePath("/reputation/testimonials");
}

export async function updateTestimonial(formData: FormData) {
  await requirePermission("testimonials.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const customerName = String(formData.get("customer_name") || "").trim();
  const customerRole = String(formData.get("customer_role") || "").trim() || null;
  const quote = String(formData.get("quote") || "").trim();
  const imageUrl = String(formData.get("image_url") || "").trim() || null;
  const rating = numberOrNull(formData.get("rating"));
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!id || !customerName || !quote) {
    throw new Error("Testimonial id, customer name and quote are required.");
  }

  const { error } = await supabase
    .from("testimonials")
    .update({
      customer_name: customerName,
      customer_role: customerRole,
      quote,
      rating,
      image_url: imageUrl,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "testimonial.updated",
    targetType: "testimonial",
    targetId: id,
    details: { customer_name: customerName },
  });

  revalidatePath("/reputation/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  await requirePermission("testimonials.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const customerName = String(formData.get("customer_name") || "Customer");

  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "testimonial.deleted",
    targetType: "testimonial",
    targetId: id,
    details: { customer_name: customerName },
  });

  revalidatePath("/reputation/testimonials");
}

export async function createTestimonialSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await createTestimonial(formData);
    return actionSuccess("Testimonial created successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Testimonial could not be created."));
  }
}

export async function updateTestimonialSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await updateTestimonial(formData);
    return actionSuccess("Testimonial updated successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Testimonial could not be updated."));
  }
}

export async function deleteTestimonialSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await deleteTestimonial(formData);
    return actionSuccess("Testimonial deleted successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Testimonial could not be deleted."));
  }
}