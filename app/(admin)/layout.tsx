// app/(admin)/layout.tsx

"use client";  
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { useSubscription } from "@/components/subscription-provider";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isGracePeriodOver } = useSubscription();

  if (isGracePeriodOver) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardContent className="py-8">
            <h1 className="text-2xl font-bold text-red-600">Subscription Expired</h1>
            <p className="text-muted-foreground mt-2">
              Your subscription has expired. Please contact support to renew.
            </p>
            <p className="text-sm mt-4">Contact: support@yourcompany.com</p>
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
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}