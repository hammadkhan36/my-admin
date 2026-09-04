"use client";

import { useActionState, useEffect } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { updateBusinessProfile } from "@/app/(admin)/business/profile/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BusinessProfileRow = {
  id: string;
  business_name: string | null;
  short_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  theme_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
};

const initialState = {
  success: false,
};

export function BusinessProfileForm({
  business,
}: {
  business: BusinessProfileRow;
}) {
  const [state, action] = useActionState(updateBusinessProfile, initialState);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Business Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update business branding and contact details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            key={`business-${business.id}-${business.business_name}-${business.short_name}-${business.contact_email}-${business.contact_phone}-${business.address}`}
            action={action}
            className="grid gap-4 md:grid-cols-2"
          >
            <input type="hidden" name="id" value={business.id} />

            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                name="business_name"
                defaultValue={business.business_name ?? ""}
                required
              />
              {state.errors?.business_name?.map((error) => (
                <p key={error} className="text-xs text-destructive">
                  {error}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_name">Short Name</Label>
              <Input
                id="short_name"
                name="short_name"
                defaultValue={business.short_name ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={business.contact_email ?? ""}
              />
              {state.errors?.contact_email?.map((error) => (
                <p key={error} className="text-xs text-destructive">
                  {error}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                defaultValue={business.contact_phone ?? ""}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={business.address ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                name="logo_url"
                defaultValue={business.logo_url ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon_url">Favicon URL</Label>
              <Input
                id="favicon_url"
                name="favicon_url"
                defaultValue={business.favicon_url ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme_color">Theme Color</Label>
              <Input
                id="theme_color"
                name="theme_color"
                defaultValue={business.theme_color ?? "#2563eb"}
              />
            </div>

            <div className="md:col-span-2">
              <PendingSubmitButton>
                <Save className="mr-2 h-4 w-4" />
                Save Business Profile
              </PendingSubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}