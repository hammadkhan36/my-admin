// ab /super-admin/-- route sirf superadmin open kar sakega. 
// Agar owner/admin/staff try karein ge to dashboard par redirect ho jayenge.


import * as React from "react";
import { AuthProvider } from "@/components/auth-provider";
import { ConfigProviders } from "@/components/config-providers";
import {
  getCurrentPermissions,
  requireSuperAdmin,
} from "@/lib/auth/server";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireSuperAdmin();
  const permissions = await getCurrentPermissions(profile);

  return (
    <AuthProvider profile={profile} permissions={permissions}>
      <ConfigProviders>{children}</ConfigProviders>
    </AuthProvider>
  );
}