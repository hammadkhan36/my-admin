import "server-only";

import { createAdminClient } from "@/lib/supabase-admin";

type CreateNotificationInput = {
  title: string;
  message?: string | null;
  type?: "info" | "success" | "warning" | "error";
  targetUrl?: string | null;
  recipientId?: string | null;
  actorId?: string | null;
};

export async function createNotification({
  title,
  message = null,
  type = "info",
  targetUrl = null,
  recipientId = null,
  actorId = null,
}: CreateNotificationInput) {
  const admin = createAdminClient();

  const { error } = await admin.from("notifications").insert({
    title,
    message,
    type,
    target_url: targetUrl,
    recipient_id: recipientId,
    actor_id: actorId,
  });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}