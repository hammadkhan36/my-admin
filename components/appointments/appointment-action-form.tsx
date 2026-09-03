"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { AppointmentActionState } from "@/app/(admin)/appointments/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const initialState: AppointmentActionState = {
  ok: false,
  message: "",
};

export function AppointmentActionForm({
  action,
  fields,
  children,
  variant = "outline",
}: {
  action: (
    state: AppointmentActionState,
    formData: FormData
  ) => Promise<AppointmentActionState>;
  fields: Record<string, string>;
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <Button type="submit" variant={variant} disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    </form>
  );
}