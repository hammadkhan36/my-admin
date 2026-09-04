"use client";

import { useActionState } from "react";
import { createReviewSafe } from "@/app/(admin)/reputation/reviews/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";

export function ReviewCreateForm() {
  const [state, formAction] = useActionState(createReviewSafe, initialActionState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Customer Name</Label>
        <Input name="customer_name" placeholder="Ali Khan" required />
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <Input name="rating" type="number" min={1} max={5} defaultValue={5} required />
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <Input name="customer_phone" placeholder="+923001234567" />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input name="customer_email" type="email" placeholder="customer@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" placeholder="Excellent service" />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <select
          name="status"
          defaultValue="approved"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Comment</Label>
        <textarea
          name="comment"
          placeholder="Write review..."
          required
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_featured" />
        Featured review
      </label>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Add Review</PendingSubmitButton>
      </div>
    </form>
  );
}


