"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function markNotificationRead(notificationId: string) {
  const profile = await requireProfile();

  if (!z.string().uuid().safeParse(notificationId).success) {
    return;
  }

  const admin = createAdminClient();

  await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .or(`recipient_id.eq.${profile.id},recipient_id.is.null`);

  revalidatePath("/crm/notifications");
}

export async function markAllNotificationsRead() {
  const profile = await requireProfile();
  const admin = createAdminClient();

  await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .or(`recipient_id.eq.${profile.id},recipient_id.is.null`)
    .is("read_at", null);

  revalidatePath("/crm/notifications");
}

export async function deleteNotification(notificationId: string) {
  await requirePermission("notifications.view");

  if (!z.string().uuid().safeParse(notificationId).success) {
    return;
  }

  const admin = createAdminClient();

  await admin.from("notifications").delete().eq("id", notificationId);

  revalidatePath("/crm/notifications");
}




export async function markNotificationReadById(notificationId: string) {
  const profile = await requireProfile();

  if (!z.string().uuid().safeParse(notificationId).success) {
    return;
  }

  const admin = createAdminClient();

  await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .or(`recipient_id.eq.${profile.id},recipient_id.is.null`);

  revalidatePath("/crm/notifications");
}