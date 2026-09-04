"use client";

import { useActionState } from "react";
import {
  createCustomFormSafe,
  updateCustomFormSafe,
} from "@/app/(admin)/website/forms/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { CustomFormRow } from "@/components/website/forms-manager";

function fieldsToText(fields: CustomFormRow["fields"]) {
  return fields
    .map((field) => `${field.label}|${field.type}|${field.required}`)
    .join("\n");
}

export function CustomFormCreateForm() {
  const [state, formAction] = useActionState(
    createCustomFormSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Form Name</Label>
          <Input name="name" placeholder="Contact Form" required />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input name="slug" placeholder="contact-form" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input name="description" placeholder="Website contact form" />
      </div>

      <div className="space-y-2">
        <Label>Fields</Label>
        <textarea
          name="fields"
          placeholder={"Full Name|text|true\nPhone|tel|true\nEmail|email|false\nMessage|textarea|true"}
          className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Format: Label|type|required. Example: Phone|tel|true
        </p>
      </div>

      <FormActionAlert state={state} />

      <div>
        <PendingSubmitButton>Create Form</PendingSubmitButton>
      </div>
    </form>
  );
}

export function CustomFormEditForm({
  form,
  onCancel,
}: {
  form: CustomFormRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    updateCustomFormSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={form.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Form Name</Label>
          <Input name="name" defaultValue={form.name} required />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input name="slug" defaultValue={form.slug} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input name="description" defaultValue={form.description ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Fields</Label>
        <textarea
          name="fields"
          defaultValue={fieldsToText(form.fields)}
          className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={form.is_active} />
        Active on website
      </label>

      <FormActionAlert state={state} />

      <div className="flex gap-2">
        <PendingSubmitButton>Save</PendingSubmitButton>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}