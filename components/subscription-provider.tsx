"use client";

import * as React from "react";
import type { SubscriptionStatus } from "@/lib/subscription/types";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

type SubscriptionContextType = {
  isExpired: boolean;
  isGracePeriodOver: boolean;
  timeToExpiry: TimeLeft | null;
  timeToGraceEnd: TimeLeft | null;
  expiryDate: Date | null;
  graceEndDate: Date | null;
};

const SubscriptionContext = React.createContext<SubscriptionContextType | null>(null);

// The server decides expired / grace (DB clock + business timezone). The browser clock is
// only used for the countdown text in the banner.
export function SubscriptionProvider({
  status,
  children,
}: {
  status: SubscriptionStatus;
  children: React.ReactNode;
}) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isLifetime = status.plan === "lifetime";
  const hasDates = !isLifetime && status.endDate !== null;
  const isExpired = status.state === "grace" || status.state === "expired";
  const isGracePeriodOver = status.state === "expired";

  // end_date is the last paid day, so the countdown runs to the end of that day.
  const expiryDate = hasDates ? new Date(`${status.endDate}T23:59:59`) : null;
  const graceEndDate = hasDates && status.graceEndDate ? new Date(`${status.graceEndDate}T23:59:59`) : null;

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

  const timeToExpiry = !isExpired && expiryDate ? calculateTimeLeft(expiryDate) : null;
  const timeToGraceEnd = isExpired && graceEndDate ? calculateTimeLeft(graceEndDate) : null;

  return (
    <SubscriptionContext.Provider
      value={{ isExpired, isGracePeriodOver, timeToExpiry, timeToGraceEnd, expiryDate, graceEndDate }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = React.useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}
