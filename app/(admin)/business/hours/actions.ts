"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

const hourRowSchema = z.object({
  id: z.string().uuid(),
  opens_at: z.string().nullable(),
  closes_at: z.string().nullable(),
  is_closed: z.boolean(),
  is_24h: z.boolean(),
});

function checkboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text ? text : null;
}

export async function updateBusinessHours(formData: FormData) {
  const actor = await requirePermission("businessHours.update");

  const ids = formData.getAll("id").map(String);
  const opens = formData.getAll("opens_at");
  const closes = formData.getAll("closes_at");

  const admin = createAdminClient();

  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];

    const result = hourRowSchema.safeParse({
      id,
      opens_at: emptyToNull(opens[index]),
      closes_at: emptyToNull(closes[index]),
      is_closed: checkboxValue(formData.get(`is_closed_${id}`)),
      is_24h: checkboxValue(formData.get(`is_24h_${id}`)),
    });

    if (!result.success) continue;

    await admin
      .from("business_hours")
      .update({
        opens_at: result.data.is_closed || result.data.is_24h ? null : result.data.opens_at,
        closes_at: result.data.is_closed || result.data.is_24h ? null : result.data.closes_at,
        is_closed: result.data.is_closed,
        is_24h: result.data.is_24h,
      })
      .eq("id", result.data.id);
  }

  await logActivity({
    actorId: actor.id,
    eventType: "business_hours.updated",
    targetType: "business_hours",
  });

  revalidatePath("/business/hours");
}

