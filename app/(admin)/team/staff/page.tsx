


// Iska kaam: server par permission check hogi, phir members list fetch hogi, 
// phir UI component ko data milega.



import {
  StaffManager,
  type TeamMember,
} from "@/components/team/staff-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function StaffPage() {
  const actor = await requirePermission("staff.view");

  const supabase = await createClient();

  // Sirf UX: buttons permission ke hisaab se dikhte hain, asal check server action mein hai.
  const [canResetPassword, canDeactivate, canDelete] = await Promise.all(
    ["staff.reset_password", "staff.deactivate", "staff.delete"].map(async (key) => {
      const { data } = await supabase.rpc("has_permission", { requested_permission: key });
      return data === true;
    })
  );

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return (
    <StaffManager
      actorId={actor.id}
      actorRole={actor.role}
      members={(data ?? []) as TeamMember[]}
      canResetPassword={canResetPassword}
      canDeactivate={canDeactivate}
      canDelete={canDelete}
    />
  );
}