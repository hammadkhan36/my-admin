"use client";

import * as React from "react";
import { useAdminConfig } from "@/components/admin-config-provider";

type SubscriptionContextType = {
  isExpired: boolean;
  isGracePeriodOver: boolean;
};

const SubscriptionContext = React.createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { config } = useAdminConfig();
  const { subscription } = config;

  // If lifetime plan or isActive false, no expiry
  const isLifetime = subscription.plan === "lifetime";
  const expiryDate = new Date(subscription.endDate);
  const now = new Date();
  const isExpired = !isLifetime && now > expiryDate;
  const graceEndDate = new Date(expiryDate);
  graceEndDate.setDate(graceEndDate.getDate() + subscription.gracePeriodDays);
  const isGracePeriodOver = !isLifetime && now > graceEndDate;

  return (
    <SubscriptionContext.Provider value={{ isExpired, isGracePeriodOver }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = React.useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}