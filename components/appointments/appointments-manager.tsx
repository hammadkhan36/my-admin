"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarClock, Loader2, Trash2 } from "lucide-react";
import {
  createAppointment,
  deleteAppointment,
  updateAppointmentStatus,
} from "@/app/(admin)/appointments/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServiceOption = {
  id: string;
  name: string;
};

export type AppointmentRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  source: string;
  notes: string | null;
  services: { name: string } | null;
};

function SubmitButton({ children, variant }: { children: React.ReactNode; variant?: "default" | "destructive" | "outline" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

function statusColor(status: string) {
  if (status === "approved") return "default";
  if (status === "completed") return "default";
  if (status === "rejected" || status === "cancelled" || status === "no_show") return "destructive";
  return "secondary";
}

export function AppointmentsManager({
  appointments,
  services,
}: {
  appointments: AppointmentRow[];
  services: ServiceOption[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const value = search.toLowerCase();

    return appointments.filter((appointment) =>
      appointment.customer_name.toLowerCase().includes(value) ||
      appointment.customer_phone.toLowerCase().includes(value) ||
      appointment.status.toLowerCase().includes(value)
    );
  }, [appointments, search]);

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.filter((item) => item.appointment_date === today).length;
  const pendingCount = appointments.filter((item) => item.status === "pending").length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Create, track and update customer appointments.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{appointments.length}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">{todayCount}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{pendingCount}</CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4" />
            Add Appointment
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createAppointment} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="customer_name" placeholder="Customer name" required />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input name="customer_phone" placeholder="+923001234567" required />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="customer_email" type="email" placeholder="optional@email.com" />
            </div>

            <div className="space-y-2">
              <Label>Service</Label>
              <select
                name="service_id"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">No service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input name="appointment_date" type="date" required />
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input name="appointment_time" type="time" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Input name="notes" placeholder="Any appointment note" />
            </div>

            <div className="md:col-span-4">
              <SubmitButton>Add Appointment</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search appointments..."
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{appointment.customer_name}</h2>
                  <Badge variant={statusColor(appointment.status)}>
                    {appointment.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">{appointment.source}</Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  {appointment.customer_phone}
                  {appointment.customer_email ? ` · ${appointment.customer_email}` : ""}
                </div>

                <div className="mt-1 text-sm">
                  {appointment.appointment_date} at {appointment.appointment_time}
                  {appointment.services?.name ? ` · ${appointment.services.name}` : ""}
                </div>

                {appointment.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">{appointment.notes}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {["pending", "approved", "completed", "rejected", "cancelled", "no_show"].map(
                  (status) => (
                    <form key={status} action={updateAppointmentStatus}>
                      <input type="hidden" name="id" value={appointment.id} />
                      <input type="hidden" name="status" value={status} />
                      <SubmitButton variant="outline">{status.replace("_", " ")}</SubmitButton>
                    </form>
                  )
                )}

                <form action={deleteAppointment}>
                  <input type="hidden" name="id" value={appointment.id} />
                  <SubmitButton variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </SubmitButton>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No appointments found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}