


"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

type BusinessProfileState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const businessProfileSchema = z.object({
  id: z.string().uuid(),
  business_name: z.string().trim().min(2, "Business name is required"),
  short_name: z.string().trim().optional(),
  contact_email: z.string().trim().email("Enter valid email").optional().or(z.literal("")),
  contact_phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  logo_url: z.string().trim().optional(),
  favicon_url: z.string().trim().optional(),
  theme_color: z.string().trim().optional(),
});

function emptyToNull(value?: string) {
  const text = value?.trim();
  return text ? text : null;
}

export async function updateBusinessProfile(
  _previousState: BusinessProfileState,
  formData: FormData
): Promise<BusinessProfileState> {
  const actor = await requirePermission("businessProfile.update");

  const result = businessProfileSchema.safeParse({
    id: formData.get("id"),
    business_name: formData.get("business_name"),
    short_name: formData.get("short_name"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
    address: formData.get("address"),
    logo_url: formData.get("logo_url"),
    favicon_url: formData.get("favicon_url"),
    theme_color: formData.get("theme_color"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("business_settings")
    .update({
      business_name: result.data.business_name,
      short_name: emptyToNull(result.data.short_name),
      contact_email: emptyToNull(result.data.contact_email),
      contact_phone: emptyToNull(result.data.contact_phone),
      address: emptyToNull(result.data.address),
      logo_url: emptyToNull(result.data.logo_url),
      favicon_url: emptyToNull(result.data.favicon_url),
      theme_color: result.data.theme_color || "#2563eb",
    })
    .eq("id", result.data.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  await logActivity({
    actorId: actor.id,
    eventType: "business_profile.updated",
    targetType: "business_settings",
    targetId: result.data.id,
    details: {
      business_name: result.data.business_name,
    },
  });

  revalidatePath("/business/profile");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Business profile updated successfully.",
  };
}