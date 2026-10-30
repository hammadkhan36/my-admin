export type SubscriptionState = "active" | "grace" | "expired" | "unknown";

export type SubscriptionStatus = {
  state: SubscriptionState;
  plan: string | null;
  endDate: string | null;
  graceEndDate: string | null;
};

export const RENEWAL_ROLES = ["superadmin", "owner"] as const;
