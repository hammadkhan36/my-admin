"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ImageIcon, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  createMediaItem,
  deleteMediaItem,
  updateMediaItem,
} from "@/app/(admin)/website/media/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type MediaRow = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  alt_text: string | null;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
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

export function MediaManager({
  items,
  title = "Media",
  description = "Manage website images and gallery items.",
}: {
  items: MediaRow[];
  title?: string;
  description?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = items.filter((item) => item.is_active).length;
  const featuredCount = items.filter((item) => item.is_featured).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Images</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{items.length}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {activeCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Featured</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {featuredCount}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            Add Media
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createMediaItem} className="grid gap-4 md:grid-cols-2">
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
              <SubmitButton>Add Media</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <Card key={item.id} className="overflow-hidden">
              {isEditing ? (
                <CardContent className="p-4">
                  <form action={updateMediaItem} className="grid gap-4">
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
                      <Input
                        name="sort_order"
                        type="number"
                        defaultValue={item.sort_order}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        name="is_featured"
                        type="checkbox"
                        defaultChecked={item.is_featured}
                      />
                      Featured
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={item.is_active}
                      />
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

                    <div className="flex gap-2">
                      <SubmitButton>Save</SubmitButton>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              ) : (
                <>
                  <div className="aspect-video bg-muted">
                    <img
                      src={item.image_url}
                      alt={item.alt_text || item.title || "Media image"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{item.title || "Untitled"}</h2>

                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>

                      {item.is_featured && <Badge variant="outline">Featured</Badge>}
                    </div>

                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.category.replace("_", " ")} · Order {item.sort_order}
                    </p>

                    {item.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(item.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <form action={deleteMediaItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          type="hidden"
                          name="title"
                          value={item.title || item.image_url}
                        />
                        <SubmitButton variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </SubmitButton>
                      </form>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          );
        })}

        {items.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No media found yet. Add your first image above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}