import Link from "next/link";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { businessNow, validDate } from "@/lib/appointments/schedule";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requirePermission("calendar.view");
  await requirePermission("appointments.view");
  const db = await createClient();
  const { data: settings, error: settingsError } = await db.from("business_settings").select("timezone").limit(1).maybeSingle();
  if (settingsError) throw new Error("Calendar settings could not be loaded.");
  const timezone = settings?.timezone || "UTC";
  const requested = (await searchParams).date;
  const date = typeof requested === "string" && validDate(requested) ? requested : businessNow(timezone).date;
  const { data: appointments, error } = await db.from("appointments")
    .select("id,customer_name,appointment_time,duration_minutes,status")
    .eq("appointment_date", date).order("appointment_time");
  if (error) throw new Error("Appointments could not be loaded. Please retry.");
  return <section className="space-y-6 p-4 md:p-6">
    <div><h1 className="text-2xl font-semibold">Appointment calendar</h1><p className="text-sm text-muted-foreground">Shared business calendar · {timezone}</p></div>
    <form method="get" className="flex flex-wrap items-end gap-3">
      <label className="grid gap-2">Date<input type="date" name="date" defaultValue={date} required className="rounded border p-2" /></label>
      <button type="submit" className="rounded border px-4 py-2">Show appointments</button>
      <Link href="/appointments" className="px-3 py-2 underline">Manage appointments</Link>
    </form>
    <h2 className="font-medium">{date}</h2>
    {appointments?.length ? <ul className="divide-y rounded border">{appointments.map(a => <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div><p className="font-medium">{a.appointment_time.slice(0,5)} · {a.customer_name}</p><p className="text-sm text-muted-foreground">{a.duration_minutes} minutes · {a.status}</p></div>
      <Link href={`/appointments/${a.id}`} className="underline">View appointment</Link>
    </li>)}</ul> : <p className="rounded border p-5 text-muted-foreground">No appointments for this date.</p>}
  </section>;
}
