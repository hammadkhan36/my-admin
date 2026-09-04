"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Search } from "lucide-react";
import { updateSeoSettings } from "@/app/(admin)/website/seo/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SeoSettingsRow = {
  id: string;
  default_meta_title: string | null;
  default_meta_description: string | null;
  default_keywords: string | null;
  og_image_url: string | null;
  enable_local_business_schema: boolean;
  enable_faq_schema: boolean;
  enable_review_schema: boolean;
  google_analytics_id: string | null;
  google_search_console_verification: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save SEO Settings
    </Button>
  );
}

export function SeoSettingsForm({ settings }: { settings: SeoSettingsRow | null }) {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SEO Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage website metadata, schema toggles and tracking IDs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Website SEO
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={updateSeoSettings} className="grid gap-4">
            <input type="hidden" name="id" value={settings?.id ?? ""} />

            <div className="space-y-2">
              <Label>Default Meta Title</Label>
              <Input
                name="default_meta_title"
                defaultValue={settings?.default_meta_title ?? ""}
                placeholder="Best Bakery in Attock"
              />
            </div>

            <div className="space-y-2">
              <Label>Default Meta Description</Label>
              <textarea
                name="default_meta_description"
                defaultValue={settings?.default_meta_description ?? ""}
                placeholder="Short description for search engines..."
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Default Keywords</Label>
              <Input
                name="default_keywords"
                defaultValue={settings?.default_keywords ?? ""}
                placeholder="bakery, cakes, Attock"
              />
            </div>

            <div className="space-y-2">
              <Label>OG Image URL</Label>
              <Input
                name="og_image_url"
                defaultValue={settings?.og_image_url ?? ""}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>

            <div className="grid gap-3 rounded-md border p-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="enable_local_business_schema"
                  defaultChecked={settings?.enable_local_business_schema ?? true}
                />
                Enable Local Business Schema
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="enable_faq_schema"
                  defaultChecked={settings?.enable_faq_schema ?? true}
                />
                Enable FAQ Schema
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="enable_review_schema"
                  defaultChecked={settings?.enable_review_schema ?? true}
                />
                Enable Review Schema
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  name="google_analytics_id"
                  defaultValue={settings?.google_analytics_id ?? ""}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>Search Console Verification</Label>
                <Input
                  name="google_search_console_verification"
                  defaultValue={
                    settings?.google_search_console_verification ?? ""
                  }
                  placeholder="verification token"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}