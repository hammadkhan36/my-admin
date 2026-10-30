"use server";

// Teeno actions useActionState ke liye ActionState return karte hain, throw nahi,
// taake rejection form mein message ban kar dikhe aur page crash na ho.
// requirePermission try ke bahar hai, kyun ke woh redirect() kar sakta hai.
// Rules: apna account edit nahi, sirf neeche rank wala member, aur
// staff.*/roles.* overrides sirf owner/superadmin.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { assertCanManageMember } from "@/lib/auth/member-guard";
import {
  DASHBOARD_CREATABLE_ROLES,
  assignableRoles,
  canGrantPermissionKey,
} from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";
import {
  actionFailure,
  actionSuccess,
  getErrorMessage,
  type ActionState,
} from "@/lib/action-state";

const updateRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(DASHBOARD_CREATABLE_ROLES),
});

const overrideSchema = z.object({
  memberId: z.string().uuid(),
  permissionKey: z.string().min(2),
  allowed: z.boolean(),
});

const removeOverrideSchema = z.object({
  memberId: z.string().uuid(),
  permissionKey: z.string().min(2),
});

const SENSITIVE_KEY_MESSAGE =
  "Only the owner can change staff and role permissions.";

export async function updateMemberRole(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requirePermission("roles.manage_overrides");

  try {
    const result = updateRoleSchema.safeParse({
      memberId: formData.get("memberId"),
      role: formData.get("role"),
    });

    if (!result.success) {
      return actionFailure("Invalid role data.");
    }

    await assertCanManageMember(actor, result.data.memberId);

    if (!assignableRoles(actor.role).includes(result.data.role)) {
      return actionFailure("You cannot assign an equal or higher role.");
    }

    const { error } = await createAdminClient()
      .from("profiles")
      .update({ role: result.data.role })
      .eq("id", result.data.memberId);

    if (error) {
      console.error("updateMemberRole failed", error);
      return actionFailure("Role could not be updated.");
    }

    await logActivity({
      actorId: actor.id,
      eventType: "member.role_updated",
      targetType: "profile",
      targetId: result.data.memberId,
      details: {
        role: result.data.role,
      },
    });

    revalidatePath("/team/roles");
    revalidatePath("/team/staff");

    return actionSuccess("Role updated successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Role could not be updated."));
  }
}

export async function setPermissionOverride(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requirePermission("roles.manage_overrides");

  try {
    const result = overrideSchema.safeParse({
      memberId: formData.get("memberId"),
      permissionKey: formData.get("permissionKey"),
      allowed: formData.get("allowed") === "true",
    });

    if (!result.success) {
      return actionFailure("Invalid permission data.");
    }

    if (!canGrantPermissionKey(actor.role, result.data.permissionKey)) {
      return actionFailure(SENSITIVE_KEY_MESSAGE);
    }

    await assertCanManageMember(actor, result.data.memberId);

    const { error } = await createAdminClient()
      .from("user_permission_overrides")
      .upsert(
        {
          user_id: result.data.memberId,
          permission_key: result.data.permissionKey,
          allowed: result.data.allowed,
          created_by: actor.id,
        },
        { onConflict: "user_id,permission_key" }
      );

    if (error) {
      console.error("setPermissionOverride failed", error);
      return actionFailure("Permission could not be updated.");
    }

    await logActivity({
      actorId: actor.id,
      eventType: "member.permission_override_updated",
      targetType: "profile",
      targetId: result.data.memberId,
      details: {
        permission_key: result.data.permissionKey,
        allowed: result.data.allowed,
      },
    });

    revalidatePath("/team/roles");

    return actionSuccess(
      result.data.allowed ? "Permission allowed." : "Permission denied."
    );
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Permission could not be updated."));
  }
}

export async function removePermissionOverride(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requirePermission("roles.manage_overrides");

  try {
    const result = removeOverrideSchema.safeParse({
      memberId: formData.get("memberId"),
      permissionKey: formData.get("permissionKey"),
    });

    if (!result.success) {
      return actionFailure("Invalid permission data.");
    }

    if (!canGrantPermissionKey(actor.role, result.data.permissionKey)) {
      return actionFailure(SENSITIVE_KEY_MESSAGE);
    }

    await assertCanManageMember(actor, result.data.memberId);

    const { error } = await createAdminClient()
      .from("user_permission_overrides")
      .delete()
      .eq("user_id", result.data.memberId)
      .eq("permission_key", result.data.permissionKey);

    if (error) {
      console.error("removePermissionOverride failed", error);
      return actionFailure("Permission could not be reset.");
    }

    await logActivity({
      actorId: actor.id,
      eventType: "member.permission_override_removed",
      targetType: "profile",
      targetId: result.data.memberId,
      details: {
        permission_key: result.data.permissionKey,
      },
    });

    revalidatePath("/team/roles");

    return actionSuccess("Permission reset to role default.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Permission could not be reset."));
  }
}
