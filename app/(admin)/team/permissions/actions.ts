"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { DASHBOARD_CREATABLE_ROLES } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase-admin";

const updateRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(DASHBOARD_CREATABLE_ROLES),
});

const overrideSchema = z.object({
  memberId: z.string().uuid(),
  permissionKey: z.string().min(2),
  allowed: z.boolean(),
});

export async function updateMemberRole(formData: FormData) {
  await requirePermission("roles.manage_overrides");

  const result = updateRoleSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });

  if (!result.success) return;

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", result.data.memberId)
    .maybeSingle();

  if (!target || target.role === "superadmin" || target.role === "owner") {
    return;
  }

  await admin
    .from("profiles")
    .update({ role: result.data.role })
    .eq("id", result.data.memberId);

  revalidatePath("/team/roles");
  revalidatePath("/team/staff");
}

export async function setPermissionOverride(formData: FormData) {
  const actor = await requirePermission("roles.manage_overrides");

  const result = overrideSchema.safeParse({
    memberId: formData.get("memberId"),
    permissionKey: formData.get("permissionKey"),
    allowed: formData.get("allowed") === "true",
  });

  if (!result.success) return;

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", result.data.memberId)
    .maybeSingle();

  if (!target || target.role === "superadmin" || target.role === "owner") {
    return;
  }

  await admin.from("user_permission_overrides").upsert(
    {
      user_id: result.data.memberId,
      permission_key: result.data.permissionKey,
      allowed: result.data.allowed,
      created_by: actor.id,
    },
    { onConflict: "user_id,permission_key" }
  );

  revalidatePath("/team/roles");
}

export async function removePermissionOverride(formData: FormData) {
  await requirePermission("roles.manage_overrides");

  const memberId = String(formData.get("memberId") || "");
  const permissionKey = String(formData.get("permissionKey") || "");

  if (!z.string().uuid().safeParse(memberId).success || !permissionKey) {
    return;
  }

  const admin = createAdminClient();

  await admin
    .from("user_permission_overrides")
    .delete()
    .eq("user_id", memberId)
    .eq("permission_key", permissionKey);

  revalidatePath("/team/roles");
}