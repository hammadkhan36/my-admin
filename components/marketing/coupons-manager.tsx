"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { BadgePercent, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  createCoupon,
  deleteCoupon,
  updateCoupon,
} from "@/app/(admin)/marketing/coupons/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CouponRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
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

function discountText(coupon: CouponRow) {
  if (coupon.discount_type === "fixed") return `${coupon.discount_value} off`;
  return `${coupon.discount_value}% off`;
}

export function CouponsManager({ coupons }: { coupons: CouponRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = coupons.filter((coupon) => coupon.is_active).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Manage code-based discounts for website forms or offers.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Coupons</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{coupons.length}</CardContent>
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
            Add Coupon
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createCoupon} className="grid gap-4 md:grid-cols-2">
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
              <SubmitButton>Add Coupon</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {coupons.map((coupon) => {
          const isEditing = editingId === coupon.id;

          return (
            <Card key={coupon.id}>
              <CardContent className="p-4">
                {isEditing ? (
                  <form action={updateCoupon} className="grid gap-4 md:grid-cols-2">
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
                      <Input
                        name="starts_at"
                        type="date"
                        defaultValue={coupon.starts_at ?? ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Ends At</Label>
                      <Input
                        name="ends_at"
                        type="date"
                        defaultValue={coupon.ends_at ?? ""}
                      />
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
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={coupon.is_active}
                      />
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
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{coupon.code}</h2>

                        <Badge variant={coupon.is_active ? "default" : "secondary"}>
                          {coupon.is_active ? "Active" : "Inactive"}
                        </Badge>

                        <Badge variant="outline">{discountText(coupon)}</Badge>
                      </div>

                      <p className="font-medium">{coupon.title}</p>

                      {coupon.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {coupon.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>
                          Valid: {formatDate(coupon.starts_at)} to {formatDate(coupon.ends_at)}
                        </span>
                        <span>
                          Used: {coupon.used_count}
                          {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(coupon.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <form action={deleteCoupon}>
                        <input type="hidden" name="id" value={coupon.id} />
                        <input type="hidden" name="code" value={coupon.code} />
                        <SubmitButton variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {coupons.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No coupons found yet. Add your first coupon above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}