"use client";

import * as React from "react";
import { SupabaseConfigProvider } from "@/components/supabase-config-provider";
import { FeaturesProvider } from "@/components/features-provider";
import { SubscriptionProvider } from "@/components/subscription-provider";
import type { SubscriptionStatus } from "@/lib/subscription/types";

export function ConfigProviders({
  subscriptionStatus,
  children,
}: {
  subscriptionStatus: SubscriptionStatus;
  children: React.ReactNode;
}) {
  return (
    <SupabaseConfigProvider>
      <FeaturesProvider>
        <SubscriptionProvider status={subscriptionStatus}>{children}</SubscriptionProvider>
      </FeaturesProvider>
    </SupabaseConfigProvider>
  );
}
