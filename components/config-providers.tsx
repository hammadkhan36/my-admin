"use client";

import * as React from "react";
import { SupabaseConfigProvider } from "@/components/supabase-config-provider";
import { FeaturesProvider } from "@/components/features-provider";
import { SubscriptionProvider } from "@/components/subscription-provider";

export function ConfigProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseConfigProvider>
      <FeaturesProvider>
        <SubscriptionProvider>{children}</SubscriptionProvider>
      </FeaturesProvider>
    </SupabaseConfigProvider>
  );
}