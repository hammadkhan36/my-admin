import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { AppointmentCreateForm } from "@/components/appointments/appointment-create-form";
export default async function Page() {
  await requirePermission("appointments.create");
  const db = await createClient();
  const { data, error } = await db.from("services").select("id,name").eq("is_active", true).order("sort_order");
  if (error) throw new Error("Could not load services.");
  return <div className="p-6"><h1 className="mb-5 text-2xl font-semibold">Create appointment</h1><AppointmentCreateForm services={data || []} /></div>;
}
