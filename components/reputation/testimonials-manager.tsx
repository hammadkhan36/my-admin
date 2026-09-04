"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Pencil, Quote, Star, Trash2 } from "lucide-react";
import {
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from "@/app/(admin)/reputation/testimonials/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export type TestimonialRow = {
  id: string;
  customer_name: string;
  customer_role: string | null;
  quote: string;
  rating: number | null;
  image_url: string | null;
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

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-sm text-muted-foreground">No rating</span>;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < rating
              ? "h-4 w-4 fill-amber-400 text-amber-400"
              : "h-4 w-4 text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

export function TestimonialsManager({
  testimonials,
}: {
  testimonials: TestimonialRow[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = testimonials.filter((item) => item.is_active).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <p className="text-sm text-muted-foreground">
          Manage customer testimonials shown on the business website.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Testimonials</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {testimonials.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {activeCount}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Quote className="h-4 w-4" />
            Add Testimonial
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createTestimonial} className="grid gap-4 md:grid-cols-2">
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
              <SubmitButton>Add Testimonial</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {testimonials.map((testimonial) => {
          const isEditing = editingId === testimonial.id;

          return (
            <Card key={testimonial.id}>
              <CardContent className="p-4">
                {isEditing ? (
                  <form action={updateTestimonial} className="grid gap-4 md:grid-cols-2">
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

                    <div className="flex gap-2 md:col-span-2">
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
                ) : (
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      {testimonial.image_url && (
                        <img
                          src={testimonial.image_url}
                          alt={testimonial.customer_name}
                          className="h-14 w-14 rounded-md object-cover"
                        />
                      )}

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">
                            {testimonial.customer_name}
                          </h2>

                          <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                            {testimonial.is_active ? "Active" : "Inactive"}
                          </Badge>

                          <Badge variant="outline">
                            Order {testimonial.sort_order}
                          </Badge>
                        </div>

                        {testimonial.customer_role && (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.customer_role}
                          </p>
                        )}

                        <div className="my-2">
                          <RatingStars rating={testimonial.rating} />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          "{testimonial.quote}"
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(testimonial.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <form action={deleteTestimonial}>
                        <input type="hidden" name="id" value={testimonial.id} />
                        <input
                          type="hidden"
                          name="customer_name"
                          value={testimonial.customer_name}
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

        {testimonials.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No testimonials found yet. Add your first testimonial above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}