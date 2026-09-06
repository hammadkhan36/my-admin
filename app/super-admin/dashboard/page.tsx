
import { CalendarClock, Lock, Save, ShieldCheck, Building2 } from "lucide-react";
import { updateBusinessSettings, updateFeatureSetting, updateSubscriptionSettings } from "@/app/super-admin/dashboard/actions";
import { requireSuperAdmin } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BusinessSettings = {
  id: string;
  business_name: string | null;
  short_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  theme_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

type FeatureSetting = {
  feature_key: string;
  enabled: boolean;
  locked: boolean;
  unlock_code: string | null;
};

type Subscription = {
  id: string;
  plan: string;
  start_date: string | null;
  end_date: string | null;
  grace_period_days: number;
  is_active: boolean;
  renewal_code: string | null;
};

export default async function SuperAdminDashboard() {
  await requireSuperAdmin();

  const supabase = await createClient();

  const [{ data: business }, { data: subscription }, { data: features }] =
    await Promise.all([
      supabase.from("business_settings").select("*").limit(1).single(),
      supabase.from("subscriptions").select("*").limit(1).single(),
      supabase.from("feature_settings").select("*").order("feature_key"),
    ]);

  const businessSettings = business as BusinessSettings | null;
  const sub = subscription as Subscription | null;
  const featureSettings = (features ?? []) as FeatureSetting[];

  const isLifetime = sub?.plan === "lifetime";
  const isActive =
    !!sub?.is_active &&
    (isLifetime || (!!sub?.end_date && new Date(sub.end_date) > new Date()));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Super Admin Control Panel</h1>
              <p className="text-muted-foreground">
                Manage business setup, subscription and feature locks.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize">{sub?.plan || "N/A"}</p>
              {isLifetime && <Badge variant="secondary">Lifetime</Badge>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expiry Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {isLifetime ? "Never" : sub?.end_date || "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isActive ? "secondary" : "destructive"} className="text-sm">
                {isActive ? "Active" : "Inactive / Expired"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="business">
              <Building2 className="mr-2 h-4 w-4" /> Business
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CalendarClock className="mr-2 h-4 w-4" /> Subscription
            </TabsTrigger>
            <TabsTrigger value="features">
              <Lock className="mr-2 h-4 w-4" /> Feature Locks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Branding and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                {businessSettings ? (
                  <form
                    key={`business-${businessSettings.id}-${businessSettings.business_name}-${businessSettings.short_name}-${businessSettings.logo_url}-${businessSettings.favicon_url}-${businessSettings.theme_color}-${businessSettings.contact_email}-${businessSettings.contact_phone}`}
                    action={updateBusinessSettings}
                    className="space-y-4"
                  >
                    <input type="hidden" name="id" value={businessSettings.id} />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input id="business_name" name="business_name" defaultValue={businessSettings.business_name ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="short_name">Short Name</Label>
                        <Input id="short_name" name="short_name" defaultValue={businessSettings.short_name ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logo_url">Logo URL</Label>
                        <Input id="logo_url" name="logo_url" defaultValue={businessSettings.logo_url ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="favicon_url">Favicon URL</Label>
                        <Input id="favicon_url" name="favicon_url" defaultValue={businessSettings.favicon_url ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theme_color">Theme Color</Label>
                        <Input id="theme_color" name="theme_color" defaultValue={businessSettings.theme_color ?? "#2563eb"} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Contact Email</Label>
                        <Input id="contact_email" name="contact_email" defaultValue={businessSettings.contact_email ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Contact Phone</Label>
                        <Input id="contact_phone" name="contact_phone" defaultValue={businessSettings.contact_phone ?? ""} />
                      </div>
                    </div>

                    <PendingSubmitButton pendingText="Saving business...">
                      <Save className="mr-2 h-4 w-4" /> Save Business Settings
                    </PendingSubmitButton>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Business settings row not found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Settings</CardTitle>
                <CardDescription>Plan, dates, grace period and renewal code.</CardDescription>
              </CardHeader>
              <CardContent>
                {sub ? (
                  <form
                    key={`subscription-${sub.id}-${sub.plan}-${sub.start_date}-${sub.end_date}-${sub.grace_period_days}-${sub.is_active}-${sub.renewal_code}`}
                    action={updateSubscriptionSettings}
                    className="space-y-6"
                  >
                    <input type="hidden" name="id" value={sub.id} />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="plan">Plan</Label>
                        <select id="plan" name="plan" defaultValue={sub.plan} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                          <option value="one-time">One-Time</option>
                          <option value="monthly">Monthly</option>
                          <option value="half-yearly">Half-Yearly</option>
                          <option value="yearly">Yearly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="is_active">Active</Label>
                        <div className="pt-2">
                          <Switch id="is_active" name="is_active" defaultChecked={sub.is_active} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" name="start_date" type="date" defaultValue={sub.start_date ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" name="end_date" type="date" defaultValue={sub.end_date ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grace_period_days">Grace Period Days</Label>
                        <Input id="grace_period_days" name="grace_period_days" type="number" defaultValue={sub.grace_period_days} />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="renewal_code">Renewal Code</Label>
                      <Input id="renewal_code" name="renewal_code" defaultValue={sub.renewal_code ?? ""} />
                    </div>

                    <PendingSubmitButton pendingText="Saving subscription...">
                      <Save className="mr-2 h-4 w-4" /> Save Subscription
                    </PendingSubmitButton>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Subscription row not found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <div className="space-y-4">
              {featureSettings.map((feature) => (
                <Card key={feature.feature_key}>
                  <CardContent className="p-4">
                    <form
                      key={`feature-${feature.feature_key}-${feature.enabled}-${feature.locked}-${feature.unlock_code}`}
                      action={updateFeatureSetting} className="grid gap-4 md:grid-cols-[1fr_auto_auto_220px_auto] md:items-end">
                      <input type="hidden" name="feature_key" value={feature.feature_key} />

                      <div>
                        <div className="font-medium capitalize">{feature.feature_key}</div>
                        <div className="text-xs text-muted-foreground">
                          {feature.enabled ? "Enabled" : "Disabled"} / {feature.locked ? "Locked" : "Unlocked"}
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <Switch name="enabled" defaultChecked={feature.enabled} />
                        Enabled
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <Switch name="locked" defaultChecked={feature.locked} />
                        Locked
                      </label>

                      <div className="space-y-2">
                        <Label htmlFor={`unlock-${feature.feature_key}`}>Unlock Code</Label>
                        <Input
                          id={`unlock-${feature.feature_key}`}
                          name="unlock_code"
                          defaultValue={feature.unlock_code ?? ""}
                        />
                      </div>

                      <PendingSubmitButton size="sm" pendingText="Saving...">
                        Save
                      </PendingSubmitButton>
                    </form>
                  </CardContent>
                </Card>
              ))}

              {featureSettings.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No feature settings found.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}