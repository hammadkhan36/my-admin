// "use client";

// import { useSubscription } from "@/components/subscription-provider";
// import { RenewSubscriptionForm } from "@/components/renew-subscription-form";
// import { AlertTriangle, Clock, CalendarClock } from "lucide-react";
// // import { format } from "date-fns"; // optional date formatting, ya simple toDateString

// export function SubscriptionBanner() {
//   const { isExpired, timeToExpiry, timeToGraceEnd, expiryDate, graceEndDate } = useSubscription();

//   // If not expiring soon (more than 7 days) and not expired, no banner
//   if (!isExpired && (!timeToExpiry || timeToExpiry.days > 7)) {
//     return null;
//   }

//   const formatDate = (date: Date) =>
//     date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

//   if (isExpired && timeToGraceEnd) {
//     // Grace period banner - red/severity
//     return (
//       <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800">
//         <div className="max-w-screen-2xl mx-auto px-4 py-3">
//           <div className="flex flex-col md:flex-row md:items-center gap-3">
//             <div className="flex items-start gap-2 flex-1">
//               <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
//               <div>
//                 <p className="font-semibold text-red-800 dark:text-red-300">
//                   Subscription Expired – Last Warning
//                 </p>
//                 <p className="text-sm text-red-700 dark:text-red-400">
//                   Grace period ends in{" "}
//                   <span className="font-bold tabular-nums">
//                     {timeToGraceEnd.days}d {timeToGraceEnd.hours}h {timeToGraceEnd.minutes}m {timeToGraceEnd.seconds}s
//                   </span>
//                   . After that, your access will be blocked.
//                 </p>
//                 <p className="text-xs text-red-600 dark:text-red-500 mt-1">
//                   Block date: {formatDate(graceEndDate)}
//                 </p>
//               </div>
//             </div>
//             <div className="w-full md:w-72">
//               <RenewSubscriptionForm />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!isExpired && timeToExpiry) {
//     // Expiring soon banner - amber
//     return (
//       <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800">
//         <div className="max-w-screen-2xl mx-auto px-4 py-3">
//           <div className="flex flex-col md:flex-row md:items-center gap-3">
//             <div className="flex items-start gap-2 flex-1">
//               <CalendarClock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
//               <div>
//                 <p className="font-semibold text-amber-800 dark:text-amber-300">
//                   Subscription Expiring Soon
//                 </p>
//                 <p className="text-sm text-amber-700 dark:text-amber-400">
//                   Expires in{" "}
//                   <span className="font-bold tabular-nums">
//                     {timeToExpiry.days}d {timeToExpiry.hours}h {timeToExpiry.minutes}m {timeToExpiry.seconds}s
//                   </span>
//                 </p>
//                 <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
//                   Expiry date: {formatDate(expiryDate)}
//                 </p>
//               </div>
//             </div>
//             <div className="w-full md:w-72">
//               <RenewSubscriptionForm />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return null;
// }





"use client";

import { useSubscription } from "@/components/subscription-provider";
import { RenewSubscriptionForm } from "@/components/renew-subscription-form";
import { AlertTriangle, Clock, CalendarClock } from "lucide-react";
// import { format } from "date-fns"; // optional date formatting, ya simple toDateString

export function SubscriptionBanner() {
  const { isExpired, timeToExpiry, timeToGraceEnd, expiryDate, graceEndDate } = useSubscription();

  // If not expiring soon (more than 7 days) and not expired, no banner
  if (!isExpired && (!timeToExpiry || timeToExpiry.days > 7)) {
    return null;
  }

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "Unavailable";

  if (isExpired && timeToGraceEnd) {
    // Grace period banner - red/severity
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-start gap-2 flex-1">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">
                  Subscription Expired – Last Warning
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Grace period ends in{" "}
                  <span className="font-bold tabular-nums">
                    {timeToGraceEnd.days}d {timeToGraceEnd.hours}h {timeToGraceEnd.minutes}m {timeToGraceEnd.seconds}s
                  </span>
                  . After that, your access will be blocked.
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                  Block date: {formatDate(graceEndDate)}
                </p>
              </div>
            </div>
            <div className="w-full md:w-72">
              <RenewSubscriptionForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isExpired && timeToExpiry) {
    // Expiring soon banner - amber
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-start gap-2 flex-1">
              <CalendarClock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Subscription Expiring Soon
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Expires in{" "}
                  <span className="font-bold tabular-nums">
                    {timeToExpiry.days}d {timeToExpiry.hours}h {timeToExpiry.minutes}m {timeToExpiry.seconds}s
                  </span>
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Expiry date: {formatDate(expiryDate)}
                </p>
              </div>
            </div>
            <div className="w-full md:w-72">
              <RenewSubscriptionForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}