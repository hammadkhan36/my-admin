"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FileText, Layers, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  createContentBlock,
  createWebsitePage,
  deleteContentBlock,
  deleteWebsitePage,
  updateContentBlock,
  updateWebsitePage,
} from "@/app/(admin)/website/pages/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export type ContentBlockRow = {
  id: string;
  page_id: string;
  block_key: string;
  block_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type WebsitePageRow = {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  created_at: string;
  website_content_blocks: ContentBlockRow[];
};

function SubmitButton({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function PagesManager({ pages }: { pages: WebsitePageRow[] }) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const activePages = pages.filter((page) => page.is_active).length;
  const blocksCount = pages.reduce(
    (total, page) => total + page.website_content_blocks.length,
    0
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Website Pages</h1>
        <p className="text-sm text-muted-foreground">
          Manage website pages and content blocks like hero, about, CTA and custom sections.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pages</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{pages.length}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Pages</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {activePages}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Content Blocks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {blocksCount}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Create Page
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createWebsitePage} className="grid gap-4 md:grid-cols-2">
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
              <SubmitButton>Create Page</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {pages.map((page) => {
          const isEditingPage = editingPageId === page.id;

          return (
            <Card key={page.id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  {page.title}
                  <Badge variant={page.is_active ? "default" : "secondary"}>
                    {page.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">/{page.slug}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {isEditingPage ? (
                  <form action={updateWebsitePage} className="grid gap-4 md:grid-cols-2">
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
                      <Input
                        name="meta_description"
                        defaultValue={page.meta_description ?? ""}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={page.is_active}
                      />
                      Active
                    </label>

                    <div className="flex gap-2 md:col-span-2">
                      <SubmitButton>Save Page</SubmitButton>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingPageId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingPageId(page.id)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Page
                    </Button>

                    <form action={deleteWebsitePage}>
                      <input type="hidden" name="id" value={page.id} />
                      <input type="hidden" name="title" value={page.title} />
                       <ConfirmSubmitButton message="Delete this item?">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Page
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                )}

                <div className="rounded-md border p-4">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <Layers className="h-4 w-4" />
                    Add Content Block
                  </h3>

                  <form action={createContentBlock} className="grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="page_id" value={page.id} />

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
                      <SubmitButton>Add Block</SubmitButton>
                    </div>
                  </form>
                </div>

                <div className="grid gap-3">
                  {page.website_content_blocks.map((block) => {
                    const isEditingBlock = editingBlockId === block.id;

                    return (
                      <Card key={block.id}>
                        <CardContent className="p-4">
                          {isEditingBlock ? (
                            <form
                              action={updateContentBlock}
                              className="grid gap-4 md:grid-cols-2"
                            >
                              <input type="hidden" name="id" value={block.id} />

                              <div className="space-y-2">
                                <Label>Block Key</Label>
                                <Input
                                  name="block_key"
                                  defaultValue={block.block_key}
                                  required
                                />
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
                                <Input
                                  name="subtitle"
                                  defaultValue={block.subtitle ?? ""}
                                />
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
                                <Input
                                  name="image_url"
                                  defaultValue={block.image_url ?? ""}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input
                                  name="sort_order"
                                  type="number"
                                  defaultValue={block.sort_order}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>CTA Label</Label>
                                <Input
                                  name="cta_label"
                                  defaultValue={block.cta_label ?? ""}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>CTA URL</Label>
                                <Input
                                  name="cta_url"
                                  defaultValue={block.cta_url ?? ""}
                                />
                              </div>

                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  name="is_active"
                                  defaultChecked={block.is_active}
                                />
                                Active
                              </label>

                              <div className="flex gap-2 md:col-span-2">
                                <SubmitButton>Save Block</SubmitButton>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingBlockId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold">{block.block_key}</h4>
                                  <Badge variant="outline">{block.block_type}</Badge>
                                  <Badge variant={block.is_active ? "default" : "secondary"}>
                                    {block.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                  <Badge variant="outline">
                                    Order {block.sort_order}
                                  </Badge>
                                </div>

                                {block.title && (
                                  <p className="font-medium">{block.title}</p>
                                )}

                                {block.subtitle && (
                                  <p className="text-sm text-muted-foreground">
                                    {block.subtitle}
                                  </p>
                                )}

                                {block.body && (
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {block.body}
                                  </p>
                                )}
                              </div>

                              <div className="flex shrink-0 flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingBlockId(block.id)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>

                                <form action={deleteContentBlock}>
                                  <input type="hidden" name="id" value={block.id} />
                                  <input
                                    type="hidden"
                                    name="block_key"
                                    value={block.block_key}
                                  />
                                  <ConfirmSubmitButton message="Delete this item?" variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </ConfirmSubmitButton>
                                </form>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {page.website_content_blocks.length === 0 && (
                    <p className="rounded-md border p-4 text-sm text-muted-foreground">
                      No content blocks added for this page yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {pages.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No website pages found yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}