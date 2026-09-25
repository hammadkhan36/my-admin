"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export async function saveCommunications(
  _state: { message: string; ok: boolean },
  form: FormData
) {
  await requirePermission("settings.update");

  const contact_mode = String(
    form.get("contact_mode") || ""
  );

  const recipient_email = String(
    form.get("recipient_email") || ""
  )
    .trim()
    .toLowerCase();

  const emails_enabled =
    form.get("emails_enabled") === "on";

  if (!["phone", "email"].includes(contact_mode)) {
    return {
      ok: false,
      message: "Choose phone or email.",
    };
  }

  const invalidEmail =
    recipient_email &&
    (
      recipient_email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email)
    );

  if (
    (emails_enabled && !recipient_email) ||
    invalidEmail
  ) {
    return {
      ok: false,
      message: "Enter a valid admin inbox email.",
    };
  }

  const emailConfigured = Boolean(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_FROM &&
    process.env.ADMIN_SITE_URL &&
    process.env.CRON_SECRET
  );

  if (emails_enabled && !emailConfigured) {
    return {
      ok: false,
      message:
        "Configure Resend, admin URL and scheduler secret before enabling emails.",
    };
  }

  const db = await createClient();

  const { data, error } = await db
    .from("communication_settings")
    .update({
      contact_mode,
      recipient_email: recipient_email || null,
      emails_enabled,
      lead_created:
        form.get("lead_created") === "on",
      appointment_created:
        form.get("appointment_created") === "on",
      appointment_status_changed:
        form.get("appointment_status_changed") === "on",
      review_created:
        form.get("review_created") === "on",
      form_submitted:
        form.get("form_submitted") === "on",
    })
    .eq("id", true)
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message:
        "Settings were not saved. Check your permissions.",
    };
  }

  revalidatePath("/system/settings");

  return {
    ok: true,
    message:
      "Settings saved. Reload open forms to use the new contact mode.",
  };
}
