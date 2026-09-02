
// Ye kya karega?

// Ab har action file mein baar baar ye nahi likhna padega:

// await admin.from("audit_logs").insert(...)

// Hum simply likhenge:

// await logActivity({
//   actorId: actor.id,
//   eventType: "member.created",
//   targetType: "profile",
//   targetId: userId,
// });


import "server-only";

import { createAdminClient } from "@/lib/supabase-admin";

type LogActivityInput = {
  actorId?: string | null;
  eventType: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown>;
};

export async function logActivity({
  actorId,
  eventType,
  targetType = null,
  targetId = null,
  details = {},
}: LogActivityInput) {
  const admin = createAdminClient();

  const { error } = await admin.from("audit_logs").insert({
    actor_id: actorId ?? null,
    event_type: eventType,
    target_type: targetType,
    target_id: targetId,
    details,
  });

  if (error) {
    console.error("Failed to write activity log:", error.message);
  }
}