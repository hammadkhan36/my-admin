"use client";

import { useActionState } from "react";
import { saveCommunications } from "@/app/(admin)/system/settings/communications/actions";

export type CommunicationSettings = {
  contact_mode: "phone" | "email";
  recipient_email: string | null;
  emails_enabled: boolean;
  lead_created: boolean;
  appointment_created: boolean;
  appointment_status_changed: boolean;
  review_created: boolean;
  form_submitted: boolean;
};

const events = [
  ["lead_created", "New leads"],
  ["appointment_created", "New appointments"],
  ["appointment_status_changed", "Appointment status changes"],
  ["review_created", "New reviews"],
  ["form_submitted", "Other form submissions"],
] as const;

type CommunicationsFormProps = {
  settings: CommunicationSettings;
  configured: boolean;
};

export function CommunicationsForm({
  settings,
  configured,
}: CommunicationsFormProps) {
  const [state, action, pending] = useActionState(
    saveCommunications,
    {
      ok: false,
      message: "",
    }
  );

  return (
    <form
      action={action}
      className="mb-6 space-y-5 rounded-xl border p-5"
    >
      <h2 className="text-xl font-semibold">
        Contact mode & email notifications
      </h2>

      <label className="block">
        Primary customer contact
        <select
          name="contact_mode"
          defaultValue={settings.contact_mode}
          className="mt-2 block rounded border bg-background p-2"
        >
          <option value="phone">
            Phone required; email optional
          </option>
          <option value="email">
            Email required; phone optional
          </option>
        </select>
      </label>

      <p className="text-sm text-muted-foreground">
        Applies to new enquiries, appointments and customer
        contact edits. Existing records are kept. Matching a
        contact does not verify ownership.
      </p>

      <label className="flex gap-2">
        <input
          type="checkbox"
          name="emails_enabled"
          defaultChecked={settings.emails_enabled}
        />
        Enable admin emails
      </label>

      <label className="block">
        Admin inbox
        <input
          name="recipient_email"
          type="email"
          maxLength={254}
          defaultValue={settings.recipient_email || ""}
          className="mt-2 block w-full rounded border bg-background p-2"
        />
      </label>

      <p className="text-sm text-muted-foreground">
        One shared business inbox receives selected events.
        This does not change staff login emails.
      </p>

      {events.map(([key, label]) => (
        <label key={key} className="flex gap-2">
          <input
            type="checkbox"
            name={key}
            defaultChecked={settings[key]}
          />
          {label}
        </label>
      ))}

      <p className="text-sm">
        {configured
          ? "Email environment variables are present. Verify the sender and scheduler before use."
          : "Email setup is incomplete. Contact mode can still be saved."}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        {pending ? "Saving…" : "Save preferences"}
      </button>

      <p
        role="status"
        className={
          state.ok ? "text-green-700" : "text-red-700"
        }
      >
        {state.message}
      </p>
    </form>
  );
}
