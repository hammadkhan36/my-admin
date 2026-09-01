// Ye client components ke liye hai. Sidebar, header, nav-user, 
// buttons wagara ko yahan se current user role aur permissions milengi.


"use client";

import * as React from "react";
import type { AuthProfile } from "@/lib/auth/roles";

type AuthContextType = {
  profile: AuthProfile;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({
  profile,
  permissions,
  children,
}: {
  profile: AuthProfile;
  permissions: string[];
  children: React.ReactNode;
}) {
  const hasPermission = React.useCallback(
    (permission: string) => {
      return permissions.includes("*") || permissions.includes(permission);
    },
    [permissions]
  );

  const value = React.useMemo(
    () => ({
      profile,
      permissions,
      hasPermission,
      isSuperAdmin: profile.role === "superadmin",
      isOwner: profile.role === "owner",
    }),
    [profile, permissions, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}