




import Link from "next/link";
import { Bell, Building2, CalendarClock, ShieldCheck, User, Users } from "lucide-react";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  await requirePermission("settings.view");

  const profile = await requireProfile();
  const supabase = await createClient();

  const [
    { data: businessSettings },
    { data: subscription },
    { count: staffCount },
    { count: unreadCount },
  ] = await Promise.all([
    supabase
      .from("business_settings")
      .select("business_name, short_name, contact_email, contact_phone, theme_color")
      .limit(1)
      .maybeSingle(),

    supabase
      .from("subscriptions")
      .select("plan, end_date, is_active")
      .limit(1)
      .maybeSingle(),

    supabase.from("profiles").select("id", { count: "exact", head: true }),

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
  ]);

  const shortcuts = [
    {
      title: "Business Profile",
      description: "Update name, contact, logo and branding.",
      href: "/business/profile",
      icon: Building2,
    },
    {
      title: "Business Hours",
      description: "Control opening hours used by appointments.",
      href: "/business/hours",
      icon: CalendarClock,
    },
    {
      title: "Staff",
      description: "Create users and manage active accounts.",
      href: "/team/staff",
      icon: Users,
    },
    {
      title: "Roles & Permissions",
      description: "Control role access and per-user overrides.",
      href: "/team/roles",
      icon: ShieldCheck,
    },
    {
      title: "Notifications",
      description: "View unread and past system notifications.",
      href: "/crm/notifications",
      icon: Bell,
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Account, business and system configuration overview.
        </p>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              My Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{profile.full_name || "Not set"}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Role</p>
              <Badge className="capitalize">{profile.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Business Name</p>
              <p className="font-medium">{businessSettings?.business_name || "Not set"}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Short Name</p>
              <p className="font-medium">{businessSettings?.short_name || "Not set"}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{businessSettings?.contact_phone || "Not set"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Subscription</p>
              <p className="font-medium capitalize">{subscription?.plan || "Not set"}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant={subscription?.is_active ? "default" : "destructive"}>
                {subscription?.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div>
              <p className="text-muted-foreground">Unread Notifications</p>
              <p className="font-medium">{unreadCount ?? 0}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Team Members</p>
              <p className="font-medium">{staffCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}