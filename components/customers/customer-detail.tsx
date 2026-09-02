"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { updateCustomer } from "@/app/(admin)/crm/customers/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CustomerDetailRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerActivityRow = {
  id: string;
  event_type: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

const initialState = {
  success: false,
};

export function CustomerDetail({
  customer,
  activities,
}: {
  customer: CustomerDetailRow;
  activities: CustomerActivityRow[];
}) {
  const [state, action] = useActionState(updateCustomer, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link href="/crm/customers">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>

          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            Customer profile, notes and activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {customer.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Edit Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={action} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={customer.id} />

              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" name="name" defaultValue={customer.name} required />
                {state.errors?.name?.map((error) => (
                  <p key={error} className="text-xs text-destructive">
                    {error}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={customer.phone} required />
                {state.errors?.phone?.map((error) => (
                  <p key={error} className="text-xs text-destructive">
                    {error}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={customer.email ?? ""} />
                {state.errors?.email?.map((error) => (
                  <p key={error} className="text-xs text-destructive">
                    {error}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={customer.address ?? ""} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" defaultValue={customer.tags.join(", ")} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" defaultValue={customer.notes ?? ""} />
              </div>

              <div className="md:col-span-2">
                <PendingSubmitButton pendingText="Saving...">
                  <Save className="mr-2 h-4 w-4" />
                  Save Customer
                </PendingSubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div className="font-medium">{customer.phone}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium">{customer.email || "N/A"}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Created</div>
                <div className="font-medium">
                  {new Date(customer.created_at).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {new Date(customer.updated_at).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border-b pb-3 last:border-0">
                  <div className="text-sm font-medium">{activity.event_type}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No activity found for this customer.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}