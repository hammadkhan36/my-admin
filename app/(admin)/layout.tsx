// // // app/(admin)/layout.tsx

// // "use client";  
// // import { AppSidebar } from "@/components/app-sidebar";
// // import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// // import { SiteHeader } from "@/components/site-header";
// // import { useSubscription } from "@/components/subscription-provider";
// // import { Card, CardContent } from "@/components/ui/card";

// // export default function DashboardLayout({ children }: { children: React.ReactNode }) {
// //   const { isGracePeriodOver } = useSubscription();

// //   if (isGracePeriodOver) {
// //     return (
// //       <div className="flex min-h-screen items-center justify-center p-4">
// //         <Card className="max-w-md text-center">
// //           <CardContent className="py-8">
// //             <h1 className="text-2xl font-bold text-red-600">Subscription Expired</h1>
// //             <p className="text-muted-foreground mt-2">
// //               Your subscription has expired. Please contact support to renew.
// //             </p>
// //             <p className="text-sm mt-4">Contact: support@yourcompany.com</p>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     );
// //   }
// //   return (
// //     <SidebarProvider
// //       style={
// //         {
// //           "--sidebar-width": "calc(var(--spacing) * 72)",
// //           "--header-height": "calc(var(--spacing) * 12)",
// //         } as React.CSSProperties
// //       }
// //     >
// //       <AppSidebar variant="inset" />
// //       <SidebarInset>
// //         <SiteHeader />
// //         <div className="flex flex-1 flex-col">
// //           {children}
// //         </div>
// //       </SidebarInset>
// //     </SidebarProvider>
// //   );
// // }








// "use client";

// import * as React from "react";
// import { AppSidebar } from "@/components/app-sidebar";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import { SiteHeader } from "@/components/site-header";
// import { useSubscription } from "@/components/subscription-provider";
// import { SubscriptionBanner } from "@/components/subscription-banner";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { RenewSubscriptionForm } from "@/components/renew-subscription-form";
// import { AlertTriangle } from "lucide-react";

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const { isGracePeriodOver } = useSubscription();

//   if (isGracePeriodOver) {
//     return (
//       <div className="flex min-h-screen items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center space-y-1">
//             <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
//             <CardTitle className="text-2xl">Subscription Expired</CardTitle>
//             <CardDescription>
//               Your subscription has expired. Contact support to renew your access.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <p className="text-sm text-muted-foreground text-center">
//               Support: support@yourcompany.com
//             </p>
//             <RenewSubscriptionForm />
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "calc(var(--spacing) * 72)",
//           "--header-height": "calc(var(--spacing) * 12)",
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <SubscriptionBanner />
//         <div className="flex flex-1 flex-col">{children}</div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }





"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { useSubscription } from "@/components/subscription-provider";
import { SubscriptionBanner } from "@/components/subscription-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RenewSubscriptionForm } from "@/components/renew-subscription-form";
import { AlertTriangle } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isGracePeriodOver } = useSubscription();

  if (isGracePeriodOver) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-1">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-2xl">Subscription Expired</CardTitle>
            <CardDescription>
              Your subscription has expired. Contact support to renew your access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Support: support@yourcompany.com
            </p>
            <RenewSubscriptionForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <SubscriptionBanner />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}