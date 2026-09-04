"use client";

import { useActionState } from "react";
import {
  createServiceSafe,
  updateServiceSafe,
} from "@/app/(admin)/crm/services/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { ServiceRow } from "@/components/services/services-manager";

export function ServiceCreateForm() {
  const [state, formAction] = useActionState(
    createServiceSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-5">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="name">Service Name</Label>
        <Input id="name" name="name" placeholder="Website Design" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" placeholder="5000" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_minutes">Duration Minutes</Label>
        <Input id="duration_minutes" name="duration_minutes" type="number" placeholder="60" />
      </div>

      <div className="flex items-end">
        <PendingSubmitButton>Add Service</PendingSubmitButton>
      </div>

      <div className="space-y-2 md:col-span-4">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="Short service detail" />
      </div>

      <label className="flex items-end gap-2 text-sm">
        <input name="show_on_website" type="checkbox" defaultChecked />
        Show on website
      </label>

      <div className="md:col-span-5">
        <FormActionAlert state={state} />
      </div>
    </form>
  );
}

export function ServiceEditForm({
  service,
  onCancel,
}: {
  service: ServiceRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    updateServiceSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-5">
      <input type="hidden" name="id" value={service.id} />

      <div className="space-y-2 md:col-span-2">
        <Label>Name</Label>
        <Input name="name" defaultValue={service.name} required />
      </div>

      <div className="space-y-2">
        <Label>Price</Label>
        <Input
          name="price"
          type="number"
          step="0.01"
          defaultValue={service.price ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Duration</Label>
        <Input
          name="duration_minutes"
          type="number"
          defaultValue={service.duration_minutes ?? ""}
        />
      </div>

      <div className="flex items-end gap-2">
        <PendingSubmitButton>Save</PendingSubmitButton>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="space-y-2 md:col-span-4">
        <Label>Description</Label>
        <Input name="description" defaultValue={service.description ?? ""} />
      </div>

      <label className="flex items-end gap-2 text-sm">
        <input
          name="show_on_website"
          type="checkbox"
          defaultChecked={service.show_on_website}
        />
        Show on website
      </label>

      <div className="md:col-span-5">
        <FormActionAlert state={state} />
      </div>
    </form>
  );
}