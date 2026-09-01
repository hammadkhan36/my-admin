
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

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    event_type: "member.created",
    target_type: "profile",
    target_id: data.user.id,
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

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    event_type: isActive ? "member.activated" : "member.deactivated",
    target_type: "profile",
    target_id: memberId,
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

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    event_type: "member.password_updated",
    target_type: "profile",
    target_id: result.data.memberId,
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

  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    event_type: "member.deleted",
    target_type: "profile",
    target_id: memberId,
  });

  revalidatePath("/team/staff");
}