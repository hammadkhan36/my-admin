"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

type ServiceAreaState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const areaSchema = z.object({
  area_name: z.string().trim().min(2, "Area name is required"),
  city: z.string().trim().optional(),
});

export async function createServiceArea(
  _previousState: ServiceAreaState,
  formData: FormData
): Promise<ServiceAreaState> {
  const actor = await requirePermission("serviceAreas.update");

  const result = areaSchema.safeParse({
    area_name: formData.get("area_name"),
    city: formData.get("city"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("service_areas")
    .insert({
      area_name: result.data.area_name,
      city: result.data.city || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  await logActivity({
    actorId: actor.id,
    eventType: "service_area.created",
    targetType: "service_area",
    targetId: data.id,
    details: {
      area_name: result.data.area_name,
    },
  });

  revalidatePath("/business/service-areas");

  return {
    success: true,
    message: "Service area created successfully.",
  };
}

export async function toggleServiceArea(areaId: string, isActive: boolean) {
  const actor = await requirePermission("serviceAreas.update");

  if (!z.string().uuid().safeParse(areaId).success) return;

  const admin = createAdminClient();

  await admin
    .from("service_areas")
    .update({ is_active: isActive })
    .eq("id", areaId);

  await logActivity({
    actorId: actor.id,
    eventType: isActive ? "service_area.activated" : "service_area.deactivated",
    targetType: "service_area",
    targetId: areaId,
  });

  revalidatePath("/business/service-areas");
}

export async function deleteServiceArea(areaId: string) {
  const actor = await requirePermission("serviceAreas.update");

  if (!z.string().uuid().safeParse(areaId).success) return;

  const admin = createAdminClient();

  await admin.from("service_areas").delete().eq("id", areaId);

  await logActivity({
    actorId: actor.id,
    eventType: "service_area.deleted",
    targetType: "service_area",
    targetId: areaId,
  });

  revalidatePath("/business/service-areas");
}