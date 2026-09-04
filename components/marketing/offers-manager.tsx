"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { BadgePercent, CalendarDays, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  createOffer,
  deleteOffer,
  updateOffer,
} from "@/app/(admin)/marketing/offers/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export type OfferRow = {
  id: string;
  title: string;
  description: string | null;
  discount_label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  cta_label: string | null;
  cta_url: string | null;
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

function formatDate(date: string | null) {
  if (!date) return "No date";
  return new Date(`${date}T12:00:00`).toLocaleDateString();
}

export function OffersManager({ offers }: { offers: OfferRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = offers.filter((offer) => offer.is_active).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Offers</h1>
        <p className="text-sm text-muted-foreground">
          Manage website promotions, discounts and seasonal deals.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Offers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{offers.length}</CardContent>
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
            <BadgePercent className="h-4 w-4" />
            Add Offer
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createOffer} className="grid gap-4 md:grid-cols-2">
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
              <SubmitButton>Add Offer</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {offers.map((offer) => {
          const isEditing = editingId === offer.id;

          return (
            <Card key={offer.id}>
              <CardContent className="p-4">
                {isEditing ? (
                  <form action={updateOffer} className="grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="id" value={offer.id} />

                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input name="title" defaultValue={offer.title} required />
                    </div>

                    <div className="space-y-2">
                      <Label>Discount Label</Label>
                      <Input
                        name="discount_label"
                        defaultValue={offer.discount_label ?? ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Starts At</Label>
                      <Input
                        name="starts_at"
                        type="date"
                        defaultValue={offer.starts_at ?? ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Ends At</Label>
                      <Input
                        name="ends_at"
                        type="date"
                        defaultValue={offer.ends_at ?? ""}
                      />
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
                      <Input
                        name="sort_order"
                        type="number"
                        defaultValue={offer.sort_order}
                      />
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
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={offer.is_active}
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
                      {offer.image_url && (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="h-20 w-24 rounded-md object-cover"
                        />
                      )}

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{offer.title}</h2>

                          <Badge variant={offer.is_active ? "default" : "secondary"}>
                            {offer.is_active ? "Active" : "Inactive"}
                          </Badge>

                          {offer.discount_label && (
                            <Badge variant="outline">{offer.discount_label}</Badge>
                          )}

                          <Badge variant="outline">Order {offer.sort_order}</Badge>
                        </div>

                        {offer.description && (
                          <p className="text-sm text-muted-foreground">
                            {offer.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(offer.starts_at)} to {formatDate(offer.ends_at)}
                          </span>

                          {offer.cta_label && <span>CTA: {offer.cta_label}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(offer.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <form action={deleteOffer}>
                        <input type="hidden" name="id" value={offer.id} />
                        <input type="hidden" name="title" value={offer.title} />
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

        {offers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No offers found yet. Add your first offer above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}