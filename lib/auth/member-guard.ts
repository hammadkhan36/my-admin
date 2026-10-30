// Team actions (staff + permissions) se pehle yeh check chalta hai:
// actor apne aap ko edit nahi kar sakta, aur sirf apne se neeche rank wale
// member ko manage kar sakta hai. Fail hone par Error throw hota hai.

import "server-only";

import { z } from "zod";
import { canManageRole, isAppRole, type AppRole, type AuthProfile } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase-admin";

export async function assertCanManageMember(
  actor: Pick<AuthProfile, "id" | "role">,
  memberId: string
): Promise<{ role: AppRole }> {
  if (!z.string().uuid().safeParse(memberId).success) {
    throw new Error("Invalid member.");
  }

  if (memberId === actor.id) {
    throw new Error("You cannot change your own account here.");
  }

  const { data: target } = await createAdminClient()
    .from("profiles")
    .select("role")
    .eq("id", memberId)
    .maybeSingle();

  if (!target || !isAppRole(target.role)) {
    throw new Error("Member not found.");
  }

  if (!canManageRole(actor.role, target.role)) {
    throw new Error("You cannot manage a member with an equal or higher role.");
  }

  return { role: target.role };
}
