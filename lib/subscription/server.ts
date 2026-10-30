import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import type { AuthProfile } from "@/lib/auth/roles";
import type { SubscriptionStatus } from "@/lib/subscription/types";

// "unknown" means the check itself failed (network/DB error). It is logged and let through,
// so a temporary outage does not lock everyone out. Only a missing row or a past date blocks.
export const getSubscriptionStatus = cache(async (): Promise<SubscriptionStatus> => {
  const unknown: SubscriptionStatus = { state: "unknown", plan: null, endDate: null, graceEndDate: null };

  try {
    const { data, error } = await createAdminClient().rpc("subscription_status");

    if (error) {
      console.error("subscription_status failed:", error.message);
      return unknown;
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      return { state: "expired", plan: null, endDate: null, graceEndDate: null };
    }

    if (row.state !== "active" && row.state !== "grace" && row.state !== "expired") {
      console.error("subscription_status returned an unexpected state:", row.state);
      return unknown;
    }

    return {
      state: row.state,
      plan: row.plan ?? null,
      endDate: row.end_date ?? null,
      graceEndDate: row.grace_end_date ?? null,
    };
  } catch (error) {
    console.error("subscription_status failed:", error instanceof Error ? error.message : error);
    return unknown;
  }
});

// Redirects to the renewal page once the subscription has expired. Superadmin is never blocked.
export async function requireActiveSubscription(profile: AuthProfile) {
  if (profile.role === "superadmin") {
    return;
  }

  const status = await getSubscriptionStatus();

  if (status.state === "expired") {
    redirect("/subscription");
  }
}

// For API routes: no redirect, just a yes/no.
export async function isSubscriptionUsable() {
  const status = await getSubscriptionStatus();

  return status.state !== "expired";
}
