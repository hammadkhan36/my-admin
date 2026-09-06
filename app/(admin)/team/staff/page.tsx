


// Iska kaam: server par permission check hogi, phir members list fetch hogi, 
// phir UI component ko data milega.



import {
  StaffManager,
  type TeamMember,
} from "@/components/team/staff-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function StaffPage() {
  await requirePermission("staff.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return <StaffManager members={(data ?? []) as TeamMember[]} />;
}