import { createAdminClient } from "@/lib/supabase-admin";
import { validDate, validTime, minutes, businessNow, fitsHours, overlaps } from "./schedule";

export async function loadAvailability(date: string, serviceId?: string | null, ignoreId?: string | null) {
  if (!validDate(date)) throw new Error("Choose a valid date.");
  const db = createAdminClient();
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  let bookings = db.from("appointments").select("appointment_time,duration_minutes")
    .eq("appointment_date", date).in("status", ["pending", "approved"]);
  if (ignoreId) bookings = bookings.neq("id", ignoreId);
  const [hours, settings, service, booked] = await Promise.all([
    db.from("business_hours").select("opens_at,closes_at,is_closed,is_24h").eq("day_of_week", day).maybeSingle(),
    db.from("business_settings").select("timezone").limit(1).maybeSingle(),
    serviceId ? db.from("services").select("duration_minutes,is_active,show_on_website").eq("id", serviceId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    bookings,
  ]);
  if (hours.error || settings.error || service.error || booked.error) throw new Error("Availability could not be loaded. Please contact the business.");
  if (serviceId && (!service.data || !service.data.is_active)) throw new Error("This service is unavailable.");
  const duration = service.data?.duration_minutes ?? 30;
  if (!Number.isInteger(duration) || duration < 1 || duration > 1440) throw new Error("Service duration is not configured correctly.");
  return {
    hours: hours.data, timezone: settings.data?.timezone || "UTC", duration,
    websiteVisible: service.data?.show_on_website ?? false,
    booked: (booked.data || []).map(b => ({ time: b.appointment_time as string, duration: b.duration_minutes as number })),
  };
}

export async function checkAppointmentAvailability(input: {
  appointmentDate: string; appointmentTime: string; serviceId?: string | null; ignoreAppointmentId?: string | null;
}): Promise<{ available: boolean; reason?: string }> {
  if (!validDate(input.appointmentDate) || !validTime(input.appointmentTime)) return { available: false, reason: "Choose a valid date and time." };
  try {
    const data = await loadAvailability(input.appointmentDate, input.serviceId, input.ignoreAppointmentId);
    const now = businessNow(data.timezone);
    const start = minutes(input.appointmentTime);
    if (input.appointmentDate < now.date || (input.appointmentDate === now.date && start <= now.minutes)) return { available: false, reason: "Choose a future appointment time." };
    if (!data.hours || !fitsHours(data.hours, start, data.duration)) return { available: false, reason: "Choose a time within business hours with enough time for the full appointment." };
    if (overlaps(start, data.duration, data.booked)) return { available: false, reason: "This time is no longer available. Choose another time." };
    return { available: true };
  } catch (error) {
    return { available: false, reason: error instanceof Error ? error.message : "Availability is temporarily unavailable." };
  }
}
