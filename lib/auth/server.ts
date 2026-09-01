import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AuthProfile, isAppRole } from "@/lib/auth/roles";

export const getCurrentProfile = cache(async (): Promise<AuthProfile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !isAppRole(data.role)) {
    return null;
  }

  return data as AuthProfile;
});

export async function requireProfile(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();

  if (!profile || !profile.is_active) {
    redirect("/?error=access_denied");
  }

  return profile;
}

export async function requireSuperAdmin(): Promise<AuthProfile> {
  const profile = await requireProfile();

  if (profile.role !== "superadmin") {
    redirect("/dashboard");
  }

  return profile;
}

export async function getCurrentPermissions(
  profile?: AuthProfile
): Promise<string[]> {
  const currentProfile = profile ?? (await requireProfile());

  if (["superadmin", "owner"].includes(currentProfile.role)) {
    return ["*"];
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_my_permissions");

  if (error) {
    return [];
  }

  return (data ?? []).map(
    (row: { permission_key: string }) => row.permission_key
  );
}

export async function requirePermission(permissionKey: string) {
  const profile = await requireProfile();

  if (["superadmin", "owner"].includes(profile.role)) {
    return profile;
  }

  const supabase = await createClient();

  const { data } = await supabase.rpc("has_permission", {
    requested_permission: permissionKey,
  });

  if (!data) {
    redirect("/dashboard?error=forbidden");
  }

  return profile;
}