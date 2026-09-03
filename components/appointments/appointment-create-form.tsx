"use client";

import { useActionState, useEffect } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import {
  createAppointmentSafe,
  type AppointmentActionState,
} from "@/app/(admin)/appointments/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ServiceOption = {
  id: string;
  name: string;
};

const initialState: AppointmentActionState = {
  ok: false,
  message: "",
};

export function AppointmentCreateForm({ services }: { services: ServiceOption[] }) {
  const [state, formAction, pending] = useActionState(
    createAppointmentSafe,
    initialState
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4" />
          Add Appointment
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-4">
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

          {state.message && !state.ok && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-4 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {state.message}
            </div>
          )}

          <div className="md:col-span-4">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Appointment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}