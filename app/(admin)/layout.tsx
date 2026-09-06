


import * as React from "react";
import { AuthProvider } from "@/components/auth-provider";
import { ConfigProviders } from "@/components/config-providers";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  getCurrentPermissions,
  requireProfile,
} from "@/lib/auth/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const permissions = await getCurrentPermissions(profile);

  return (
    <AuthProvider profile={profile} permissions={permissions}>
      <ConfigProviders>
        <DashboardShell>{children}</DashboardShell>
      </ConfigProviders>
    </AuthProvider>
  );
}