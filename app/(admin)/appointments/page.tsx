


import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import {
  AppointmentsManager,
  type AppointmentRow,
} from "@/components/appointments/appointments-manager";

type ServiceOption = {
  id: string;
  name: string;
};

export default async function AppointmentsPage() {
  await requirePermission("appointments.view");

  const supabase = await createClient();

  const [{ data: appointments, error: appointmentsError }, { data: services, error: servicesError }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select(
          `
          id,
          customer_name,
          customer_phone,
          customer_email,
          appointment_date,
          appointment_time,
          status,
          source,
          notes,
          services:service_id (
            name
          )
        `
        )
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true }),

      supabase
        .from("services")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

  if (appointmentsError) throw new Error(appointmentsError.message);
  if (servicesError) throw new Error(servicesError.message);

  return (
    <AppointmentsManager
      appointments={(appointments ?? []).map((appointment) => ({
        ...appointment,
        services: {
          name: appointment.services?.[0]?.name ?? "",
        },
      })) as AppointmentRow[]}
      services={(services ?? []) as ServiceOption[]}
    />
  );
}