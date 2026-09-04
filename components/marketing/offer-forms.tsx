"use client";

import { useActionState } from "react";
import {
  createOfferSafe,
  updateOfferSafe,
} from "@/app/(admin)/marketing/offers/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { OfferRow } from "@/components/marketing/offers-manager";

export function OfferCreateForm() {
  const [state, formAction] = useActionState(createOfferSafe, initialActionState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" placeholder="20% Off This Week" required />
      </div>

      <div className="space-y-2">
        <Label>Discount Label</Label>
        <Input name="discount_label" placeholder="20% OFF" />
      </div>

      <div className="space-y-2">
        <Label>Starts At</Label>
        <Input name="starts_at" type="date" />
      </div>

      <div className="space-y-2">
        <Label>Ends At</Label>
        <Input name="ends_at" type="date" />
      </div>

      <div className="space-y-2">
        <Label>CTA Label</Label>
        <Input name="cta_label" placeholder="Book Now" />
      </div>

      <div className="space-y-2">
        <Label>CTA URL</Label>
        <Input name="cta_url" placeholder="/contact" />
      </div>

      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input name="image_url" placeholder="https://example.com/offer.jpg" />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={0} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <textarea
          name="description"
          placeholder="Offer details..."
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Add Offer</PendingSubmitButton>
      </div>
    </form>
  );
}

export function OfferEditForm({
  offer,
  onCancel,
}: {
  offer: OfferRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(updateOfferSafe, initialActionState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={offer.id} />

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" defaultValue={offer.title} required />
      </div>

      <div className="space-y-2">
        <Label>Discount Label</Label>
        <Input name="discount_label" defaultValue={offer.discount_label ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Starts At</Label>
        <Input name="starts_at" type="date" defaultValue={offer.starts_at ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Ends At</Label>
        <Input name="ends_at" type="date" defaultValue={offer.ends_at ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>CTA Label</Label>
        <Input name="cta_label" defaultValue={offer.cta_label ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>CTA URL</Label>
        <Input name="cta_url" defaultValue={offer.cta_url ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input name="image_url" defaultValue={offer.image_url ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={offer.sort_order} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <textarea
          name="description"
          defaultValue={offer.description ?? ""}
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={offer.is_active} />
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