
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { ServicesManager, type ServiceRow } from "@/components/services/services-manager";

export default async function AppointmentServicesPage() {
  await requirePermission("services.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <ServicesManager
      services={(data ?? []) as ServiceRow[]}
      title="Appointment Services"
      description="Services used for appointment duration, pricing and booking setup."
    />
  );
}