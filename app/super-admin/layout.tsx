// ab /super-admin/-- route sirf superadmin open kar sakega. 
// Agar owner/admin/staff try karein ge to dashboard par redirect ho jayenge.


import * as React from "react";
import { AuthProvider } from "@/components/auth-provider";
import { ConfigProviders } from "@/components/config-providers";
import {
  getCurrentPermissions,
  requireSuperAdmin,
} from "@/lib/auth/server";
import { getSubscriptionStatus } from "@/lib/subscription/server";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireSuperAdmin();
  const permissions = await getCurrentPermissions(profile);
  const subscriptionStatus = await getSubscriptionStatus();

  return (
    <AuthProvider profile={profile} permissions={permissions}>
      <ConfigProviders subscriptionStatus={subscriptionStatus}>{children}</ConfigProviders>
    </AuthProvider>
  );
}