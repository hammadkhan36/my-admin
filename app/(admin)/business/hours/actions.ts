"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";
import { minutes, validTime } from "@/lib/appointments/schedule";
import {
  actionFailure,
  actionSuccess,
  getErrorMessage,
  type ActionState,
} from "@/lib/action-state";

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

export async function updateBusinessHours(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requirePermission("businessHours.update");

  const ids = formData.getAll("id").map(String);
  const opens = formData.getAll("opens_at");
  const closes = formData.getAll("closes_at");

  const rows: z.infer<typeof hourRowSchema>[] = [];
  const dayNames = formData.getAll("day_name").map(String);

  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const day = dayNames[index] || "A day";

    const result = hourRowSchema.safeParse({
      id,
      opens_at: emptyToNull(opens[index] ?? null),
      closes_at: emptyToNull(closes[index] ?? null),
      is_closed: checkboxValue(formData.get(`is_closed_${id}`)),
      is_24h: checkboxValue(formData.get(`is_24h_${id}`)),
    });

    if (!result.success) {
      return actionFailure(`${day}: invalid hours row.`);
    }

    const row = result.data;

    if (!row.is_closed && !row.is_24h) {
      if (!row.opens_at || !row.closes_at) {
        return actionFailure(
          `${day}: set both opening and closing time, or mark the day Closed or 24h.`
        );
      }

      if (!validTime(row.opens_at) || !validTime(row.closes_at)) {
        return actionFailure(`${day}: enter valid times.`);
      }

      if (minutes(row.closes_at) <= minutes(row.opens_at)) {
        return actionFailure(
          `${day}: closing time must be after opening time. Overnight hours are not supported.`
        );
      }
    }

    rows.push(row);
  }

  try {
    const admin = createAdminClient();

    for (const row of rows) {
      const clearTimes = row.is_closed || row.is_24h;
      const { error } = await admin
        .from("business_hours")
        .update({
          opens_at: clearTimes ? null : row.opens_at,
          closes_at: clearTimes ? null : row.closes_at,
          is_closed: row.is_closed,
          is_24h: row.is_24h,
        })
        .eq("id", row.id);

      if (error) throw error;
    }

    await logActivity({
      actorId: actor.id,
      eventType: "business_hours.updated",
      targetType: "business_hours",
    });

    revalidatePath("/business/hours");
    return actionSuccess("Business hours saved.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Business hours could not be saved."));
  }
}
