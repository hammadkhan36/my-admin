// Ye basically aapka current app/(admin)/layout.tsx wala UI hai, 
// bas reusable component bana diya. Ab next step mein app/(admin)/layout.tsx ko 
// server layout banayenge, jo login/role check karega.

"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SubscriptionBanner } from "@/components/subscription-banner";


export function DashboardShell({ children }: { children: React.ReactNode }) {
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