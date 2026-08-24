// "use client";

// import * as React from "react";
// import { useAdminConfig } from "@/components/admin-config-provider";

// type TimeLeft = {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// };

// type SubscriptionContextType = {
//   isExpired: boolean;
//   isGracePeriodOver: boolean;
//   timeToExpiry: TimeLeft | null;      // if not expired
//   timeToGraceEnd: TimeLeft | null;    // if expired
//   expiryDate: Date;
//   graceEndDate: Date;
//   renewWithCode: (code: string) => boolean;
// };

// const SubscriptionContext = React.createContext<SubscriptionContextType | null>(null);

// function calculateTimeLeft(target: Date, now: Date): TimeLeft {
//   const diff = target.getTime() - now.getTime();
//   if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
//   const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//   const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//   const seconds = Math.floor((diff % (1000 * 60)) / 1000);
//   return { days, hours, minutes, seconds };
// }

// export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
//   const { config, updateSubscription } = useAdminConfig();
//   const { subscription, renewalCode } = config;

//   const [now, setNow] = React.useState(() => new Date());

//   React.useEffect(() => {
//     const interval = setInterval(() => setNow(new Date()), 1000); // every second
//     return () => clearInterval(interval);
//   }, []);

//   const isLifetime = subscription.plan === "lifetime";
//   const expiryDate = new Date(subscription.endDate);
//   const isExpired = !isLifetime && now > expiryDate;

//   const graceEndDate = new Date(expiryDate);
//   graceEndDate.setDate(graceEndDate.getDate() + subscription.gracePeriodDays);
//   const isGracePeriodOver = !isLifetime && now > graceEndDate;

//   const timeToExpiry = !isExpired ? calculateTimeLeft(expiryDate, now) : null;
//   const timeToGraceEnd = isExpired ? calculateTimeLeft(graceEndDate, now) : null;

//   const renewWithCode = (code: string) => {
//     if (code !== renewalCode) return false;
//     const startDate = new Date();
//     let newEndDate = new Date(startDate);
//     const plan = subscription.plan;
//     if (plan === "monthly") newEndDate.setMonth(newEndDate.getMonth() + 1);
//     else if (plan === "half-yearly") newEndDate.setMonth(newEndDate.getMonth() + 6);
//     else if (plan === "yearly") newEndDate.setFullYear(newEndDate.getFullYear() + 1);
//     else if (plan === "one-time") newEndDate.setFullYear(newEndDate.getFullYear() + 1);
//     else return true; // lifetime

//     updateSubscription({
//       startDate: startDate.toISOString().split("T")[0],
//       endDate: newEndDate.toISOString().split("T")[0],
//       isActive: true,
//     });
//     return true;
//   };

//   return (
//     <SubscriptionContext.Provider
//       value={{
//         isExpired,
//         isGracePeriodOver,
//         timeToExpiry,
//         timeToGraceEnd,
//         expiryDate,
//         graceEndDate,
//         renewWithCode,
//       }}
//     >
//       {children}
//     </SubscriptionContext.Provider>
//   );
// }

// export function useSubscription() {
//   const context = React.useContext(SubscriptionContext);
//   if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
//   return context;
// }




"use client";

import * as React from "react";
import { useAdminConfig } from "@/components/admin-config-provider";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type SubscriptionContextType = {
  isExpired: boolean;
  isGracePeriodOver: boolean;
  timeToExpiry: TimeLeft | null;      // if not expired
  timeToGraceEnd: TimeLeft | null;    // if expired
  expiryDate: Date;
  graceEndDate: Date;
  renewWithCode: (code: string) => boolean;
};

const SubscriptionContext = React.createContext<SubscriptionContextType | null>(null);

function calculateTimeLeft(target: Date, now: Date): TimeLeft {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { config, updateSubscription } = useAdminConfig();
  const { subscription, renewalCode } = config;

  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000); // every second
    return () => clearInterval(interval);
  }, []);

  const isLifetime = subscription.plan === "lifetime";
  const expiryDate = new Date(subscription.endDate);
  const isExpired = !isLifetime && now > expiryDate;

  const graceEndDate = new Date(expiryDate);
  graceEndDate.setDate(graceEndDate.getDate() + subscription.gracePeriodDays);
  const isGracePeriodOver = !isLifetime && now > graceEndDate;

  const timeToExpiry = !isExpired ? calculateTimeLeft(expiryDate, now) : null;
  const timeToGraceEnd = isExpired ? calculateTimeLeft(graceEndDate, now) : null;

  const renewWithCode = (code: string) => {
    if (code !== renewalCode) return false;
    const startDate = new Date();
    let newEndDate = new Date(startDate);
    const plan = subscription.plan;
    if (plan === "monthly") newEndDate.setMonth(newEndDate.getMonth() + 1);
    else if (plan === "half-yearly") newEndDate.setMonth(newEndDate.getMonth() + 6);
    else if (plan === "yearly") newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    else if (plan === "one-time") newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    else return true; // lifetime

    updateSubscription({
      startDate: startDate.toISOString().split("T")[0],
      endDate: newEndDate.toISOString().split("T")[0],
      isActive: true,
    });
    return true;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isExpired,
        isGracePeriodOver,
        timeToExpiry,
        timeToGraceEnd,
        expiryDate,
        graceEndDate,
        renewWithCode,
      }}
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