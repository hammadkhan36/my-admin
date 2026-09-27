"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { useSupabaseConfig } from "@/components/supabase-config-provider";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

type SubscriptionContextType = {
  isExpired: boolean;
  isGracePeriodOver: boolean;
  timeToExpiry: TimeLeft | null;
  timeToGraceEnd: TimeLeft | null;
  expiryDate: Date | null;
  graceEndDate: Date | null;
  renewWithCode: (code: string) => Promise<boolean>;
};

const SubscriptionContext = React.createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { subscription, refreshData } = useSupabaseConfig();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!subscription) {
    return <SubscriptionContext.Provider value={{ isExpired: false, isGracePeriodOver: false, timeToExpiry: null, timeToGraceEnd: null, expiryDate: null, graceEndDate: null, renewWithCode: async () => false }}>{children}</SubscriptionContext.Provider>;
  }

  const isLifetime = subscription.plan === "lifetime";
  const expiryDate = new Date(subscription.end_date || "2099-12-31");
  const isExpired = !isLifetime && now > expiryDate;
  const graceEndDate = new Date(expiryDate);
  graceEndDate.setDate(graceEndDate.getDate() + subscription.grace_period_days);
  const isGracePeriodOver = !isLifetime && now > graceEndDate;

  function calculateTimeLeft(target: Date): TimeLeft {
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }

  const timeToExpiry = !isExpired ? calculateTimeLeft(expiryDate) : null;
  const timeToGraceEnd = isExpired ? calculateTimeLeft(graceEndDate) : null;

  const renewWithCode = async (code: string) => {
    const value = code.trim();
    if (value.length < 8 || new TextEncoder().encode(value).length > 72) return false;
    const { data, error } = await createClient().rpc("renew_subscription", { code: value });
    if (error || data !== true) return false;
    await refreshData();
    return true;
  };

  return (
    <SubscriptionContext.Provider value={{ isExpired, isGracePeriodOver, timeToExpiry, timeToGraceEnd, expiryDate, graceEndDate, renewWithCode }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = React.useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}