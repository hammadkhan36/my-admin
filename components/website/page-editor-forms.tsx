"use client";

import { useActionState } from "react";
import {
  createContentBlockSafe,
  createWebsitePageSafe,
  updateContentBlockSafe,
  updateWebsitePageSafe,
} from "@/app/(admin)/website/pages/actions";
import { FormActionAlert } from "@/components/form-action-alert";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialActionState } from "@/lib/action-state";
import type {
  ContentBlockRow,
  WebsitePageRow,
} from "@/components/website/pages-manager";

export function WebsitePageCreateForm() {
  const [state, formAction] = useActionState(
    createWebsitePageSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" placeholder="About Us" required />
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input name="slug" placeholder="about" />
      </div>

      <div className="space-y-2">
        <Label>Meta Title</Label>
        <Input name="meta_title" placeholder="About ABC Bakery" />
      </div>

      <div className="space-y-2">
        <Label>Meta Description</Label>
        <Input name="meta_description" placeholder="Short SEO description" />
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Create Page</PendingSubmitButton>
      </div>
    </form>
  );
}

export function WebsitePageEditForm({
  page,
  onCancel,
}: {
  page: WebsitePageRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    updateWebsitePageSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={page.id} />

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" defaultValue={page.title} required />
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input name="slug" defaultValue={page.slug} required />
      </div>

      <div className="space-y-2">
        <Label>Meta Title</Label>
        <Input name="meta_title" defaultValue={page.meta_title ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Meta Description</Label>
        <Input name="meta_description" defaultValue={page.meta_description ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={page.is_active} />
        Active
      </label>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="flex gap-2 md:col-span-2">
        <PendingSubmitButton>Save Page</PendingSubmitButton>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ContentBlockCreateForm({ pageId }: { pageId: string }) {
  const [state, formAction] = useActionState(
    createContentBlockSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="page_id" value={pageId} />

      <div className="space-y-2">
        <Label>Block Key</Label>
        <Input name="block_key" placeholder="hero-main" required />
      </div>

      <div className="space-y-2">
        <Label>Block Type</Label>
        <select
          name="block_type"
          defaultValue="text"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="hero">Hero</option>
          <option value="text">Text</option>
          <option value="cta">CTA</option>
          <option value="image">Image</option>
          <option value="rich_text">Rich Text</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" placeholder="Welcome to our business" />
      </div>

      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input name="subtitle" placeholder="Short supporting text" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Body</Label>
        <textarea
          name="body"
          placeholder="Content body..."
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input name="image_url" placeholder="https://example.com/hero.jpg" />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={0} />
      </div>

      <div className="space-y-2">
        <Label>CTA Label</Label>
        <Input name="cta_label" placeholder="Book Now" />
      </div>

      <div className="space-y-2">
        <Label>CTA URL</Label>
        <Input name="cta_url" placeholder="/contact" />
      </div>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="md:col-span-2">
        <PendingSubmitButton>Add Block</PendingSubmitButton>
      </div>
    </form>
  );
}

export function ContentBlockEditForm({
  block,
  onCancel,
}: {
  block: ContentBlockRow;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    updateContentBlockSafe,
    initialActionState
  );

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={block.id} />

      <div className="space-y-2">
        <Label>Block Key</Label>
        <Input name="block_key" defaultValue={block.block_key} required />
      </div>

      <div className="space-y-2">
        <Label>Block Type</Label>
        <select
          name="block_type"
          defaultValue={block.block_type}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="hero">Hero</option>
          <option value="text">Text</option>
          <option value="cta">CTA</option>
          <option value="image">Image</option>
          <option value="rich_text">Rich Text</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" defaultValue={block.title ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input name="subtitle" defaultValue={block.subtitle ?? ""} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Body</Label>
        <textarea
          name="body"
          defaultValue={block.body ?? ""}
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input name="image_url" defaultValue={block.image_url ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input name="sort_order" type="number" defaultValue={block.sort_order} />
      </div>

      <div className="space-y-2">
        <Label>CTA Label</Label>
        <Input name="cta_label" defaultValue={block.cta_label ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>CTA URL</Label>
        <Input name="cta_url" defaultValue={block.cta_url ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={block.is_active} />
        Active
      </label>

      <div className="md:col-span-2">
        <FormActionAlert state={state} />
      </div>

      <div className="flex gap-2 md:col-span-2">
        <PendingSubmitButton>Save Block</PendingSubmitButton>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}