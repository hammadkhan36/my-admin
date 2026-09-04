"use client";

import { useActionState } from "react";
import {
  createFaqSafe,
  updateFaqSafe,
} from "@/app/(admin)/website/faqs/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { FaqRow } from "@/components/website/faqs-manager";

export function FaqCreateForm() {
  const [state, formAction] = useActionState(createFaqSafe, initialActionState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input name="question" placeholder="What services do you offer?" required />
      </div>

      <div className="space-y-2">
        <Label>Answer</Label>
        <textarea
          name="answer"
          placeholder="Write the answer here..."
          required
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2 sm:max-w-xs">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={0} />
      </div>

      <FormActionAlert state={state} />

      <div>
        <PendingSubmitButton>Add FAQ</PendingSubmitButton>
      </div>
    </form>
  );
}

export function FaqEditForm({
  faq,
  onCancel,
}: {
  faq: FaqRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(updateFaqSafe, initialActionState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={faq.id} />

      <div className="space-y-2">
        <Label>Question</Label>
        <Input name="question" defaultValue={faq.question} required />
      </div>

      <div className="space-y-2">
        <Label>Answer</Label>
        <textarea
          name="answer"
          defaultValue={faq.answer}
          required
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input name="sort_order" type="number" defaultValue={faq.sort_order} />
        </div>

        <label className="flex items-end gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={faq.is_active}
          />
          Active on website
        </label>
      </div>

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