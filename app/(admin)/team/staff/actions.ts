
// Ye actions kya karte hain:

// createTeamMember dashboard se new user banata hai.

// email_confirm: true ka matlab user ko email verification ki zaroorat nahi.

// superadmin aur owner create nahi ho sakte, kyun ke form sirf admin, manager, 
// supervisor, staff allow karta hai.

// setMemberActive kisi member ko active/inactive karta hai. 
// Owner aur superadmin ko dashboard se deactivate nahi kar sakte.


// updateMemberPassword selected staff/admin ka password change karega.

// deleteTeamMember member ko Supabase Auth se delete karega. superadmin aur owner delete nahi honge.


"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { DASHBOARD_CREATABLE_ROLES } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";
import {
  actionFailure,
  actionSuccess,
  getErrorMessage,
  type ActionState,
} from "@/lib/action-state";

export type CreateMemberState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const createMemberSchema = z.object({
  fullName: z.string().trim().min(2, "Name must contain at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(10, "Password must contain at least 10 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(DASHBOARD_CREATABLE_ROLES),
});

export async function createTeamMember(
  _previousState: CreateMemberState,
  formData: FormData
): Promise<CreateMemberState> {
  const actor = await requirePermission("staff.create");

  const result = createMemberSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: result.data.email,
    password: result.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: result.data.fullName,
    },
  });

  if (error || !data.user) {
    return {
      success: false,
      message: error?.message ?? "Could not create member",
    };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: result.data.fullName,
      role: result.data.role,
      created_by: actor.id,
      is_active: true,
    })
    .eq("id", data.user.id);

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return {
      success: false,
      message: "Account profile could not be created",
    };
  }

  await logActivity({
    actorId: actor.id,
    eventType: "member.created",
    targetType: "profile",
    targetId: data.user.id,
    details: {
      role: result.data.role,
      email: result.data.email,
    },
  });
  revalidatePath("/team/staff");

  return {
    success: true,
    message: "Team member created successfully",
  };
}

export async function setMemberActive(memberId: string, isActive: boolean) {
  const actor = await requirePermission("staff.deactivate");

  if (!z.string().uuid().safeParse(memberId).success || memberId === actor.id) {
    return;
  }

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", memberId)
    .maybeSingle();

  if (!target || target.role === "superadmin" || target.role === "owner") {
    return;
  }

  await admin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", memberId);

  await logActivity({
    actorId: actor.id,
    eventType: isActive ? "member.activated" : "member.deactivated",
    targetType: "profile",
    targetId: memberId,
  });

  revalidatePath("/team/staff");
}



const updatePasswordSchema = z.object({
  memberId: z.string().uuid(),
  password: z
    .string()
    .min(10, "Password must contain at least 10 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export async function updateMemberPassword(formData: FormData) {
  const actor = await requirePermission("staff.update");

  const result = updatePasswordSchema.safeParse({
    memberId: formData.get("memberId"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return;
  }

  if (result.data.memberId === actor.id) {
    return;
  }

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", result.data.memberId)
    .maybeSingle();

  if (!target || target.role === "superadmin" || target.role === "owner") {
    return;
  }

  await admin.auth.admin.updateUserById(result.data.memberId, {
    password: result.data.password,
  });

  await logActivity({
    actorId: actor.id,
    eventType: "member.password_updated",
    targetType: "profile",
    targetId: result.data.memberId,
  });

  revalidatePath("/team/staff");
}

export async function deleteTeamMember(memberId: string) {
  const actor = await requirePermission("staff.delete");

  if (!z.string().uuid().safeParse(memberId).success || memberId === actor.id) {
    return;
  }

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", memberId)
    .maybeSingle();

  if (!target || target.role === "superadmin" || target.role === "owner") {
    return;
  }

  await admin.from("profiles").update({ is_active: false }).eq("id", memberId);

  await admin.auth.admin.deleteUser(memberId);

  await logActivity({
    actorId: actor.id,
    eventType: "member.deleted",
    targetType: "profile",
    targetId: memberId,
  });

  revalidatePath("/team/staff");
}




export async function createTeamMemberSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const result = await createTeamMember({}, formData);

    if (result?.success === false) {
      if (result.message) {
        return actionFailure(result.message);
      }

      const firstError = Object.values(result.errors || {})[0]?.[0];

      return actionFailure(firstError || "Team member could not be created.");
    }

    return actionSuccess(result?.message || "Team member created successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Team member could not be created."));
  }
}

export async function setMemberActiveSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const memberId = String(formData.get("memberId") || formData.get("id") || "");
    const currentActive = String(formData.get("isActive") || formData.get("is_active")) === "true";

    if (!memberId) {
      return actionFailure("Member id is required.");
    }

    await setMemberActive(memberId, !currentActive);

    return actionSuccess(
      currentActive
        ? "Team member deactivated successfully."
        : "Team member activated successfully."
    );
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Team member status could not be updated."));
  }
}

export async function updateMemberPasswordSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const memberId = String(formData.get("memberId") || formData.get("id") || "");
    const password = String(formData.get("password") || "");

    const fixedFormData = new FormData();
    fixedFormData.set("memberId", memberId);
    fixedFormData.set("password", password);

    await updateMemberPassword(fixedFormData);

    return actionSuccess("Password updated successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Password could not be updated."));
  }
}

export async function deleteTeamMemberSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const memberId = String(formData.get("memberId") || formData.get("id") || "");

    if (!memberId) {
      return actionFailure("Member id is required.");
    }

    await deleteTeamMember(memberId);

    return actionSuccess("Team member deleted successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "Team member could not be deleted."));
  }
}