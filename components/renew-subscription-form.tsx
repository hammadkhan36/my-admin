"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActionAlert } from "@/components/form-action-alert";
import { renewSubscription } from "@/app/subscription/actions";
import { initialActionState } from "@/lib/action-state";

export function RenewSubscriptionForm({ redirectOnSuccess }: { redirectOnSuccess?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(renewSubscription, initialActionState);

  useEffect(() => {
    if (state.ok && redirectOnSuccess) {
      router.replace(redirectOnSuccess);
    }
  }, [state, redirectOnSuccess, router]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="renewal-code">Renewal Code</Label>
        <Input
          id="renewal-code"
          name="code"
          required
          autoComplete="off"
          placeholder="Enter code provided by support"
          className="h-9"
        />
      </div>
      <FormActionAlert state={state} />
      <Button type="submit" className="w-full h-9" disabled={pending}>
        {pending ? "Renewing..." : "Renew Subscription"}
      </Button>
    </form>
  );
}
