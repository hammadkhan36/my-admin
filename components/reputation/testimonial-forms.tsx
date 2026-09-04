"use client";

import { useActionState } from "react";
import {
  createTestimonialSafe,
  updateTestimonialSafe,
} from "@/app/(admin)/reputation/testimonials/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { TestimonialRow } from "@/components/reputation/testimonials-manager";

export function TestimonialCreateForm() {
  const [state, formAction] = useActionState(
    createTestimonialSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Customer Name</Label>
        <Input name="customer_name" placeholder="Ali Khan" required />
      </div>

      <div className="space-y-2">
        <Label>Customer Role</Label>
        <Input name="customer_role" placeholder="Regular customer" />
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <Input name="rating" type="number" min={1} max={5} placeholder="5" />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={0} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Image URL</Label>
        <Input name="image_url" placeholder="https://example.com/customer.jpg" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Quote</Label>
        <textarea
          name="quote"
          placeholder="Write customer testimonial..."
          required
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Add Testimonial</PendingSubmitButton>
      </div>
    </form>
  );
}

export function TestimonialEditForm({
  testimonial,
  onCancel,
}: {
  testimonial: TestimonialRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    updateTestimonialSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={testimonial.id} />

      <div className="space-y-2">
        <Label>Customer Name</Label>
        <Input
          name="customer_name"
          defaultValue={testimonial.customer_name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Customer Role</Label>
        <Input
          name="customer_role"
          defaultValue={testimonial.customer_role ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <Input
          name="rating"
          type="number"
          min={1}
          max={5}
          defaultValue={testimonial.rating ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input
          name="sort_order"
          type="number"
          defaultValue={testimonial.sort_order}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Image URL</Label>
        <Input
          name="image_url"
          defaultValue={testimonial.image_url ?? ""}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Quote</Label>
        <textarea
          name="quote"
          defaultValue={testimonial.quote}
          required
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={testimonial.is_active}
        />
        Active on website
      </label>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="flex gap-2 md:col-span-2">
        <PendingSubmitButton>Save</PendingSubmitButton>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


