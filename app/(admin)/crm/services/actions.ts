"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createClient } from "@/lib/supabase-server";
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

export async function createService(formData: FormData) {
  await requirePermission("services.manage");
  const profile = await requireProfile();
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = numberOrNull(formData.get("price"));
  const durationMinutes = numberOrNull(formData.get("duration_minutes"));
  const showOnWebsite = formData.get("show_on_website") === "on";

  if (!name) {
    throw new Error("Service name is required.");
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      name,
      description: description || null,
      price,
      duration_minutes: durationMinutes,
      show_on_website: showOnWebsite,
      created_by: profile.id,
    })
    .select("id, name")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "service.created",
    targetType: "service",
    targetId: data.id,
    details: { name: data.name },
  });

  revalidatePath("/crm/services");
  revalidatePath("/appointments/services");
  revalidatePath("/website/services");
}

export async function updateService(formData: FormData) {
  await requirePermission("services.manage");
  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = numberOrNull(formData.get("price"));
  const durationMinutes = numberOrNull(formData.get("duration_minutes"));
  const showOnWebsite = formData.get("show_on_website") === "on";

  if (!id || !name) {
    throw new Error("Service id and name are required.");
  }

  const { error } = await supabase
    .from("services")
    .update({
      name,
      description: description || null,
      price,
      duration_minutes: durationMinutes,
      show_on_website: showOnWebsite,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "service.updated",
    targetType: "service",
    targetId: id,
    details: { name },
  });

  revalidatePath("/crm/services");
  revalidatePath("/appointments/services");
  revalidatePath("/website/services");
}

export async function toggleServiceStatus(formData: FormData) {
  await requirePermission("services.manage");
  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("is_active")) === "true";
  const name = String(formData.get("name") || "Service");

  const { error } = await supabase
    .from("services")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: !isActive ? "service.activated" : "service.deactivated",
    targetType: "service",
    targetId: id,
    details: { name },
  });

  revalidatePath("/crm/services");
  revalidatePath("/appointments/services");
  revalidatePath("/website/services");
}

export async function deleteService(formData: FormData) {
  await requirePermission("services.manage");
  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "Service");

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "service.deleted",
    targetType: "service",
    targetId: id,
    details: { name },
  });

  revalidatePath("/crm/services");
  revalidatePath("/appointments/services");
  revalidatePath("/website/services");
}



export async function createServiceSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await createService(formData);
    return actionSuccess("Service created successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Service could not be created."));
  }
}

export async function updateServiceSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await updateService(formData);
    return actionSuccess("Service updated successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Service could not be updated."));
  }
}

export async function toggleServiceStatusSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await toggleServiceStatus(formData);
    return actionSuccess("Service status updated successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Service status could not be updated."));
  }
}

export async function deleteServiceSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await deleteService(formData);
    return actionSuccess("Service deleted successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Service could not be deleted."));
  }
}


