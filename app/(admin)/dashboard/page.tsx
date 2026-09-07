import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Phone,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActivityRow = {
  id: string;
  event_type: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
};

type WebsiteEventRow = {
  event_type: string;
  path: string;
  label: string | null;
  visitor_id: string | null;
  created_at: string;
};

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  source: string | null;
  status: string | null;
  created_at: string;
};

type AppointmentRow = {
  id: string;
  customer_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
};

function getActorName(profile: ActivityRow["profiles"]) {
  const actor = Array.isArray(profile) ? profile[0] : profile;
  return actor?.full_name || actor?.email || "System";
}

function readableEvent(eventType: string) {
  return eventType.replaceAll("_", " ").replaceAll(".", " ");
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getStartOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function getThirtyDaysAgoIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

function MetricCard({
  title,
  value,
  note,
  href,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  note: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition hover:bg-muted/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  await requirePermission("dashboard.view");

  const supabase = await createClient();

  const todayIso = getStartOfTodayIso();
  const last30DaysIso = getThirtyDaysAgoIso();

  const [
    { count: leadsCount },
    { count: customersCount },
    { count: appointmentsCount },
    { count: pendingAppointmentsCount },
    { count: unreadNotificationsCount },
    { data: todayLeads },
    { data: todayAppointments },
    { data: websiteEvents },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),

    supabase.from("customers").select("id", { count: "exact", head: true }),

    supabase.from("appointments").select("id", { count: "exact", head: true }),

    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),

    supabase
      .from("leads")
      .select("id, name, phone, source, status, created_at")
      .gte("created_at", todayIso)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("appointments")
      .select("id, customer_name, appointment_date, appointment_time, status, created_at")
      .gte("created_at", todayIso)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("website_events")
      .select("event_type, path, label, visitor_id, created_at")
      .gte("created_at", last30DaysIso)
      .order("created_at", { ascending: false })
      .limit(5000),

    supabase
      .from("audit_logs")
      .select(
        `
        id,
        event_type,
        created_at,
        profiles:actor_id (
          full_name,
          email
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const leadsToday = (todayLeads ?? []) as LeadRow[];
  const appointmentsToday = (todayAppointments ?? []) as AppointmentRow[];
  const events = (websiteEvents ?? []) as WebsiteEventRow[];
  const activities = (recentActivity ?? []) as ActivityRow[];

  const pageViews = events.filter((event) => event.event_type === "page_view").length;
  const visitors = new Set(events.map((event) => event.visitor_id).filter(Boolean)).size;
  const callClicks = events.filter((event) => event.event_type === "call_click").length;
  const whatsappClicks = events.filter((event) => event.event_type === "whatsapp_click").length;
  const bookingClicks = events.filter((event) => event.event_type === "booking_click").length;
  const leadSubmits = events.filter((event) => event.event_type === "lead_submit").length;

  const actionRequired =
    leadsToday.length + appointmentsToday.length + (pendingAppointmentsCount ?? 0);

  const clickRate = percentage(
    callClicks + whatsappClicks + bookingClicks,
    pageViews
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Simple overview of leads, appointments, website activity and team actions.
          </p>
        </div>

        <Link
          href="/analytics"
          className="inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          <BarChart3 className="h-4 w-4" />
          View Full Analytics
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Leads"
          value={leadsCount ?? 0}
          note="All captured leads"
          href="/crm/leads"
          icon={UserPlus}
        />

        <MetricCard
          title="Customers"
          value={customersCount ?? 0}
          note="Saved customer records"
          href="/crm/customers"
          icon={Users}
        />

        <MetricCard
          title="Appointments"
          value={appointmentsCount ?? 0}
          note={`${pendingAppointmentsCount ?? 0} pending approval`}
          href="/appointments"
          icon={CalendarClock}
        />

        <MetricCard
          title="Unread Notifications"
          value={unreadNotificationsCount ?? 0}
          note="Needs attention"
          href="/crm/notifications"
          icon={Bell}
        />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Today&apos;s Action Required
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Link href="/crm/leads" className="rounded-md border p-3 hover:bg-muted">
              <p className="text-sm text-muted-foreground">New Leads Today</p>
              <p className="text-2xl font-bold text-blue-600">{leadsToday.length}</p>
            </Link>

            <Link href="/appointments" className="rounded-md border p-3 hover:bg-muted">
              <p className="text-sm text-muted-foreground">New Appointments Today</p>
              <p className="text-2xl font-bold text-violet-600">
                {appointmentsToday.length}
              </p>
            </Link>

            <Link href="/appointments" className="rounded-md border p-3 hover:bg-muted">
              <p className="text-sm text-muted-foreground">Pending Appointments</p>
              <p className="text-2xl font-bold text-amber-600">
                {pendingAppointmentsCount ?? 0}
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Business Health
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Today focus</span>
              <Badge variant={actionRequired > 0 ? "default" : "outline"}>
                {actionRequired > 0 ? "Needs Review" : "All Clear"}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Website click rate</span>
              <span className="text-sm font-medium">{clickRate}%</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Lead submits tracked</span>
              <span className="text-sm font-medium">{leadSubmits}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Website Snapshot</h2>
            <p className="text-sm text-muted-foreground">
              Last 30 days website visits and high-intent clicks.
            </p>
          </div>

          <Link className="text-sm text-primary hover:underline" href="/analytics">
            Details
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Page Views"
            value={pageViews}
            note="Website pages opened"
            href="/analytics"
            icon={Eye}
          />

          <MetricCard
            title="Visitors"
            value={visitors}
            note="Unique tracked visitors"
            href="/analytics"
            icon={Users}
          />

          <MetricCard
            title="Call Clicks"
            value={callClicks}
            note="People tapped call"
            href="/analytics"
            icon={Phone}
          />

          <MetricCard
            title="WhatsApp Clicks"
            value={whatsappClicks}
            note="People opened WhatsApp"
            href="/analytics"
            icon={MousePointerClick}
          />

          <MetricCard
            title="Booking Clicks"
            value={bookingClicks}
            note="People showed booking intent"
            href="/analytics"
            icon={CalendarClock}
          />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-2">
            <Link className="rounded-md border p-3 text-sm hover:bg-muted" href="/crm/leads">
              View Leads
            </Link>

            <Link className="rounded-md border p-3 text-sm hover:bg-muted" href="/appointments">
              Manage Appointments
            </Link>

            <Link className="rounded-md border p-3 text-sm hover:bg-muted" href="/crm/customers">
              View Customers
            </Link>

            <Link className="rounded-md border p-3 text-sm hover:bg-muted" href="/system/activity-logs">
              Activity Logs
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Latest Leads</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {leadsToday.map((lead) => (
              <Link
                key={lead.id}
                href={`/crm/leads/${lead.id}`}
                className="block rounded-md border p-3 hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{lead.phone}</p>
                  </div>

                  <Badge variant="outline" className="capitalize">
                    {lead.source || "manual"}
                  </Badge>
                </div>
              </Link>
            ))}

            {leadsToday.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No new leads today.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="border-b pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm font-medium capitalize">
                  {readableEvent(activity.event_type)}
                </p>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="truncate text-xs text-muted-foreground">
                    {getActorName(activity.profiles)}
                  </p>

                  <Badge variant="outline">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </Badge>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}