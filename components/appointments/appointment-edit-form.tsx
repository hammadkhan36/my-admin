"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  type AppointmentActionState,
  updateAppointmentDetailsSafe,
} from "@/app/(admin)/appointments/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ServiceOption = {
  id: string;
  name: string;
};

type AppointmentEditFormProps = {
  appointment: {
    id: string;
    service_id: string | null;
    appointment_date: string;
    appointment_time: string;
    notes: string | null;
  };
  services: ServiceOption[];
};

const initialState: AppointmentActionState = {
  ok: false,
  message: "",
};

export function AppointmentEditForm({
  appointment,
  services,
}: AppointmentEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateAppointmentDetailsSafe,
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
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={appointment.id} />

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <input
          name="appointment_date"
          type="date"
          defaultValue={appointment.appointment_date}
          required
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Time</label>
        <input
          name="appointment_time"
          type="time"
          defaultValue={appointment.appointment_time.slice(0, 5)}
          required
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Service</label>
        <select
          name="service_id"
          defaultValue={appointment.service_id ?? ""}
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
        <label className="text-sm font-medium">Notes</label>
        <input
          name="notes"
          defaultValue={appointment.notes ?? ""}
          placeholder="Appointment notes"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      {state.message && !state.ok && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {state.message}
        </div>
      )}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}