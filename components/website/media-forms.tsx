"use client";

import { useActionState } from "react";
import {
  createMediaItemSafe,
  updateMediaItemSafe,
} from "@/app/(admin)/website/media/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type { MediaRow } from "@/components/website/media-manager";

export function MediaCreateForm() {
  const [state, formAction] = useActionState(
    createMediaItemSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" placeholder="Store front photo" />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <select
          name="category"
          defaultValue="gallery"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="gallery">Gallery</option>
          <option value="hero">Hero</option>
          <option value="portfolio">Portfolio</option>
          <option value="before_after">Before / After</option>
          <option value="team">Team</option>
        </select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Image URL</Label>
        <Input name="image_url" placeholder="https://example.com/image.jpg" required />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Alt Text</Label>
        <Input name="alt_text" placeholder="Short image description for SEO" />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={0} />
      </div>

      <label className="flex items-end gap-2 text-sm">
        <input name="is_featured" type="checkbox" />
        Featured image
      </label>

      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <textarea
          name="description"
          placeholder="Optional image details"
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Add Media</PendingSubmitButton>
      </div>
    </form>
  );
}

export function MediaEditForm({
  item,
  onCancel,
}: {
  item: MediaRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    updateMediaItemSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={item.id} />

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" defaultValue={item.title ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <select
          name="category"
          defaultValue={item.category}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="gallery">Gallery</option>
          <option value="hero">Hero</option>
          <option value="portfolio">Portfolio</option>
          <option value="before_after">Before / After</option>
          <option value="team">Team</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input name="image_url" defaultValue={item.image_url} required />
      </div>

      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input name="alt_text" defaultValue={item.alt_text ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={item.sort_order} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input name="is_featured" type="checkbox" defaultChecked={item.is_featured} />
        Featured
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input name="is_active" type="checkbox" defaultChecked={item.is_active} />
        Active
      </label>

      <div className="space-y-2">
        <Label>Description</Label>
        <textarea
          name="description"
          defaultValue={item.description ?? ""}
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
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