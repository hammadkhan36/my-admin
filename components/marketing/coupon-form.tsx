"use client";

import { useActionState } from "react";
import {
  createCouponSafe,
  updateCouponSafe,
} from "@/app/(admin)/marketing/coupons/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { CouponRow } from "@/components/marketing/coupons-manager";

export function CouponCreateForm() {
  const [state, formAction] = useActionState(createCouponSafe, initialActionState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Coupon Code</Label>
        <Input name="code" placeholder="WELCOME10" required />
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" placeholder="Welcome Discount" required />
      </div>

      <div className="space-y-2">
        <Label>Discount Type</Label>
        <select
          name="discount_type"
          defaultValue="percent"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Discount Value</Label>
        <Input name="discount_value" type="number" step="0.01" defaultValue={0} />
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
        <Label>Usage Limit</Label>
        <Input name="usage_limit" type="number" placeholder="Optional" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <textarea
          name="description"
          placeholder="Coupon details..."
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Add Coupon</PendingSubmitButton>
      </div>
    </form>
  );
}

export function CouponEditForm({
  coupon,
  onCancel,
}: {
  coupon: CouponRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(updateCouponSafe, initialActionState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={coupon.id} />

      <div className="space-y-2">
        <Label>Coupon Code</Label>
        <Input name="code" defaultValue={coupon.code} required />
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" defaultValue={coupon.title} required />
      </div>

      <div className="space-y-2">
        <Label>Discount Type</Label>
        <select
          name="discount_type"
          defaultValue={coupon.discount_type}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Discount Value</Label>
        <Input
          name="discount_value"
          type="number"
          step="0.01"
          defaultValue={coupon.discount_value}
        />
      </div>

      <div className="space-y-2">
        <Label>Starts At</Label>
        <Input name="starts_at" type="date" defaultValue={coupon.starts_at ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Ends At</Label>
        <Input name="ends_at" type="date" defaultValue={coupon.ends_at ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Usage Limit</Label>
        <Input
          name="usage_limit"
          type="number"
          defaultValue={coupon.usage_limit ?? ""}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={coupon.is_active} />
        Active
      </label>

      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <textarea
          name="description"
          defaultValue={coupon.description ?? ""}
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="flex gap-2 md:col-span-2">
        <PendingSubmitButton>Save</PendingSubmitButton>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-md border px-4 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}