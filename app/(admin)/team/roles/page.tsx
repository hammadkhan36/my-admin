



import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import {
  MemberPermissionsManager,
  type PermissionMember,
  type PermissionRow,
  type RolePermissionRow,
  type UserOverrideRow,
} from "@/components/team/member-permissions-manager";

export default async function RolesPage() {
  await requirePermission("roles.manage_overrides");

  const supabase = await createClient();

  const [
    { data: members },
    { data: permissions },
    { data: rolePermissions },
    { data: overrides },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, is_active")
      .order("created_at", { ascending: true }),

    supabase
      .from("permissions")
      .select("permission_key, feature_key, action, description")
      .order("feature_key", { ascending: true })
      .order("action", { ascending: true }),

    supabase
      .from("role_permissions")
      .select("role, permission_key, allowed"),

    supabase
      .from("user_permission_overrides")
      .select("user_id, permission_key, allowed"),
  ]);

  return (
    <MemberPermissionsManager
      members={(members ?? []) as PermissionMember[]}
      permissions={(permissions ?? []) as PermissionRow[]}
      rolePermissions={(rolePermissions ?? []) as RolePermissionRow[]}
      overrides={(overrides ?? []) as UserOverrideRow[]}
    />
  );
}