"use client";
import { useActionState } from "react";
import { createCustomer } from "@/app/(admin)/crm/customers/actions";
import { createLead } from "@/app/(admin)/crm/leads/actions";
import { ContactInput } from "@/components/contacts/contact-input";
export function CreateRecordForm({ kind }: { kind: "customer" | "lead" }) {
  const [state, action, pending] = useActionState(kind === "customer" ? createCustomer : createLead, { success: false, message: "", errors: {} });
  const input = "mt-1 block w-full rounded border bg-background p-2";
  return <form action={action} className="max-w-xl space-y-4 rounded-xl border p-5">
    <label className="block">Name<input name="name" required minLength={2} maxLength={100} className={input} /></label>
    <label className="block">Phone<ContactInput name="phone" kind="phone" /></label>
    <label className="block">Email<ContactInput name="email" kind="email" /></label>
    {kind === "customer" ? <>
      <label className="block">Address<input name="address" className={input} /></label>
      <label className="block">Tags (comma separated)<input name="tags" className={input} /></label>
      <label className="block">Notes<textarea name="notes" className={input} /></label>
    </> : <>
      <label className="block">Service<input name="service" className={input} /></label>
      <label className="block">Message<textarea name="message" className={input} /></label>
      <input type="hidden" name="source" value="manual" /><input type="hidden" name="status" value="new" /><input type="hidden" name="priority" value="normal" />
    </>}
    {Object.entries(state.errors || {}).map(([key, messages]) => <p key={key} role="alert">{key}: {messages?.join(", ")}</p>)}
    <p role="status">{state.message}</p>
    <button disabled={pending || state.success} className="rounded bg-primary px-4 py-2 text-primary-foreground">{pending ? "Saving…" : state.success ? "Saved" : `Create ${kind}`}</button>
  </form>;
}
