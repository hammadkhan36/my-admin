"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

const businessSettingsSchema = z.object({
  id: z.string().uuid(),
  business_name: z.string().trim().nullable(),
  short_name: z.string().trim().nullable(),
  logo_url: z.string().trim().nullable(),
  favicon_url: z.string().trim().nullable(),
  theme_color: z.string().trim().default("#2563eb"),
  contact_email: z.string().trim().nullable(),
  contact_phone: z.string().trim().nullable(),
});

const subscriptionSchema = z.object({
  id: z.string().uuid(),
  plan: z.enum(["one-time", "monthly", "half-yearly", "yearly", "lifetime"]),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  grace_period_days: z.coerce.number().int().min(0).max(60),
  is_active: z.boolean(),
  renewal_code: z.string().trim().nullable(),
});

const featureSchema = z.object({
  feature_key: z.string().min(2),
  enabled: z.boolean(),
  locked: z.boolean(),
  unlock_code: z.string().trim().nullable(),
});

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function checkboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function updateBusinessSettings(formData: FormData) {
  const actor = await requireSuperAdmin();

  const result = businessSettingsSchema.safeParse({
    id: formData.get("id"),
    business_name: nullableString(formData.get("business_name")),
    short_name: nullableString(formData.get("short_name")),
    logo_url: nullableString(formData.get("logo_url")),
    favicon_url: nullableString(formData.get("favicon_url")),
    theme_color: String(formData.get("theme_color") || "#2563eb"),
    contact_email: nullableString(formData.get("contact_email")),
    contact_phone: nullableString(formData.get("contact_phone")),
  });

  if (!result.success) {
    throw new Error("Invalid business settings");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("business_settings")
    .update({
      business_name: result.data.business_name,
      short_name: result.data.short_name,
      logo_url: result.data.logo_url,
      favicon_url: result.data.favicon_url,
      theme_color: result.data.theme_color,
      contact_email: result.data.contact_email,
      contact_phone: result.data.contact_phone,
    })
    .eq("id", result.data.id);

  if (error) {
    throw new Error(error.message);
  }

  await logActivity({
    actorId: actor.id,
    eventType: "business_settings.updated",
    targetType: "business_settings",
    targetId: result.data.id,
  });

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/dashboard");
}

export async function updateSubscriptionSettings(formData: FormData) {
  const actor = await requireSuperAdmin();

  const result = subscriptionSchema.safeParse({
    id: formData.get("id"),
    plan: formData.get("plan"),
    start_date: nullableString(formData.get("start_date")),
    end_date: nullableString(formData.get("end_date")),
    grace_period_days: formData.get("grace_period_days"),
    is_active: checkboxValue(formData.get("is_active")),
    renewal_code: nullableString(formData.get("renewal_code")),
  });

  if (!result.success) {
    throw new Error("Invalid subscription settings");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("subscriptions")
    .update({
      plan: result.data.plan,
      start_date: result.data.start_date,
      end_date:
        result.data.plan === "lifetime"
          ? "2099-12-31"
          : result.data.end_date,
      grace_period_days: result.data.grace_period_days,
      is_active: result.data.is_active,
      renewal_code: result.data.renewal_code,
    })
    .eq("id", result.data.id);

  if (error) {
    throw new Error(error.message);
  }

  await logActivity({
    actorId: actor.id,
    eventType: "subscription.updated",
    targetType: "subscription",
    targetId: result.data.id,
    details: {
      plan: result.data.plan,
      is_active: result.data.is_active,
    },
  });

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/dashboard");
}

export async function updateFeatureSetting(formData: FormData) {
  const actor = await requireSuperAdmin();

  const result = featureSchema.safeParse({
    feature_key: formData.get("feature_key"),
    enabled: checkboxValue(formData.get("enabled")),
    locked: checkboxValue(formData.get("locked")),
    unlock_code: nullableString(formData.get("unlock_code")),
  });

  if (!result.success) {
    throw new Error("Invalid feature setting");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("feature_settings")
    .update({
      enabled: result.data.enabled,
      locked: result.data.locked,
      unlock_code: result.data.unlock_code,
    })
    .eq("feature_key", result.data.feature_key);

  if (error) {
    throw new Error(error.message);
  }

  await logActivity({
    actorId: actor.id,
    eventType: "feature_setting.updated",
    targetType: "feature_settings",
    targetId: result.data.feature_key,
    details: {
      enabled: result.data.enabled,
      locked: result.data.locked,
    },
  });

  revalidatePath("/super-admin/dashboard");
  revalidatePath("/dashboard");
}