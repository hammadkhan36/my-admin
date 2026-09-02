// Ye basically aapka current app/(admin)/layout.tsx wala UI hai, 
// bas reusable component bana diya. Ab next step mein app/(admin)/layout.tsx ko 
// server layout banayenge, jo login/role check karega.

"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { useSubscription } from "@/components/subscription-provider";
import { SubscriptionBanner } from "@/components/subscription-banner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RenewSubscriptionForm } from "@/components/renew-subscription-form";
import { AlertTriangle } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
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