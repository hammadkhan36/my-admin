"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { RENEWAL_ROLES } from "@/lib/subscription/types";
import { actionFailure, actionSuccess, type ActionState } from "@/lib/action-state";

// renew_subscription itself writes the "subscription.renewed" / "renew_failed" audit rows,
// and it re-checks the owner/superadmin role in SQL.
export async function renewSubscription(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireProfile({ allowExpiredSubscription: true });

  if (!(RENEWAL_ROLES as readonly string[]).includes(profile.role)) {
    return actionFailure("Only the owner can renew the subscription.");
  }

  const code = String(formData.get("code") ?? "").trim();

  if (code.length < 8 || new TextEncoder().encode(code).length > 72) {
    return actionFailure("Invalid renewal code.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("renew_subscription", { code });

  if (error?.message?.includes("renewal_locked")) {
    return actionFailure("Too many attempts. Please try again in 15 minutes.");
  }

  if (error || data !== true) {
    return actionFailure("Invalid renewal code.");
  }

  revalidatePath("/", "layout");

  return actionSuccess("Subscription renewed successfully!");
}
