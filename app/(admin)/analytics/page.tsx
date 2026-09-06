import { Activity, CalendarCheck, Eye, MousePointerClick, Target, Users } from "lucide-react";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WebsiteEventRow = {
  id: string;
  event_type: string;
  path: string;
  label: string | null;
  metadata: Record<string, unknown> | null;
  visitor_id: string | null;
  session_id: string | null;
  referrer_domain: string | null;
  created_at: string;
};

type LeadRow = {
  id: string;
  source: string | null;
  status: string | null;
  created_at: string;
  page_url: string | null;
  utm_source: string | null;
};

type AppointmentRow = {
  id: string;
  status: string;
  source: string;
  created_at: string;
};

const CLICK_EVENTS = new Set([
  "call_click",
  "whatsapp_click",
  "map_click",
  "booking_click",
]);

function getLast30DaysIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

function countBy<T>(rows: T[], getValue: (row: T) => string | null | undefined) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = getValue(row)?.trim() || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(map: Record<string, number>, limit = 5) {
  return Object.entries(map)
    .filter(([key]) => key !== "unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function formatEventType(eventType: string) {
  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTrafficSource(event: WebsiteEventRow) {
  const utmSource = event.metadata?.utm_source;

  if (typeof utmSource === "string" && utmSource.trim()) {
    return utmSource;
  }

  return event.referrer_domain || "Direct";
}

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  await requirePermission("analytics.view");

  const supabase = await createClient();
  const last30Days = getLast30DaysIso();

  const [
    { data: websiteEvents, error: websiteEventsError },
    { data: leads, error: leadsError },
    { data: appointments, error: appointmentsError },
    { count: customersCount, error: customersError },
  ] = await Promise.all([
    supabase
      .from("website_events")
      .select("id, event_type, path, label, metadata, visitor_id, session_id, referrer_domain, created_at")
      .gte("created_at", last30Days)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("leads")
      .select("id, source, status, created_at, page_url, utm_source")
      .gte("created_at", last30Days)
      .order("created_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("id, status, source, created_at")
      .gte("created_at", last30Days)
      .order("created_at", { ascending: false }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
  ]);

  if (websiteEventsError) throw new Error(websiteEventsError.message);
  if (leadsError) throw new Error(leadsError.message);
  if (appointmentsError) throw new Error(appointmentsError.message);
  if (customersError) throw new Error(customersError.message);

  const eventRows = (websiteEvents ?? []) as WebsiteEventRow[];
  const leadRows = (leads ?? []) as LeadRow[];
  const appointmentRows = (appointments ?? []) as AppointmentRow[];

  const pageViews = eventRows.filter((event) => event.event_type === "page_view");
  const clickEvents = eventRows.filter((event) => CLICK_EVENTS.has(event.event_type));
  const conversionEvents = eventRows.filter(
    (event) =>
      event.event_type.endsWith("_submit") ||
      event.event_type === "coupon_validate" ||
      event.event_type === "coupon_redeem"
  );

  const uniqueVisitors = new Set(eventRows.map((event) => event.visitor_id).filter(Boolean)).size;
  const sessions = new Set(eventRows.map((event) => event.session_id).filter(Boolean)).size;
  const approvedAppointments = appointmentRows.filter(
    (appointment) => appointment.status === "approved" || appointment.status === "completed"
  ).length;
  const leadToAppointmentRate = percentage(approvedAppointments, leadRows.length);
  const visitorToLeadRate = percentage(leadRows.length, uniqueVisitors);

  const topPages = topEntries(countBy(pageViews, (event) => event.path), 6);
  const topButtons = topEntries(
    countBy(clickEvents, (event) => event.label || formatEventType(event.event_type)),
    6
  );
  const trafficSources = topEntries(countBy(pageViews, getTrafficSource), 6);
  const leadsBySource = topEntries(countBy(leadRows, (lead) => lead.source), 6);
  const recentEvents = eventRows.slice(0, 10);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Last 30 days overview for website visits, button clicks, leads and appointments.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Page Views"
          value={pageViews.length}
          note="Tracked website page visits"
          icon={Eye}
        />
        <MetricCard
          title="Visitors"
          value={uniqueVisitors}
          note={`${sessions} tracked sessions`}
          icon={Users}
        />
        <MetricCard
          title="Button Clicks"
          value={clickEvents.length}
          note="Call, WhatsApp, map and booking clicks"
          icon={MousePointerClick}
        />
        <MetricCard
          title="Conversions"
          value={conversionEvents.length}
          note="Forms, coupons, reviews and appointments"
          icon={Target}
        />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Leads"
          value={leadRows.length}
          note={`${visitorToLeadRate}% visitor to lead rate`}
          icon={Activity}
        />
        <MetricCard
          title="Customers"
          value={customersCount ?? 0}
          note="Total customers"
          icon={Users}
        />
        <MetricCard
          title="Appointments"
          value={appointmentRows.length}
          note={`${approvedAppointments} approved/completed`}
          icon={CalendarCheck}
        />
        <MetricCard
          title="Lead to Appointment"
          value={`${leadToAppointmentRate}%`}
          note="Basic conversion rate"
          icon={Target}
        />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPages.map(([page, count]) => (
              <div key={page} className="flex items-center justify-between gap-3">
                <p className="truncate text-sm">{page}</p>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {topPages.length === 0 && (
              <p className="text-sm text-muted-foreground">No page views tracked yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topButtons.map(([button, count]) => (
              <div key={button} className="flex items-center justify-between gap-3">
                <p className="truncate text-sm">{button}</p>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {topButtons.length === 0 && (
              <p className="text-sm text-muted-foreground">No button clicks tracked yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trafficSources.map(([source, count]) => (
              <div key={source} className="flex items-center justify-between gap-3">
                <p className="truncate text-sm capitalize">{source}</p>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {trafficSources.length === 0 && (
              <p className="text-sm text-muted-foreground">No traffic source data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadsBySource.map(([source, count]) => (
              <div key={source} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium capitalize">{source}</p>
                  <p className="text-xs text-muted-foreground">
                    {percentage(count, leadRows.length)}% of leads
                  </p>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {leadsBySource.length === 0 && (
              <p className="text-sm text-muted-foreground">No leads found yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Website Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge variant="outline">{formatEventType(event.event_type)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">{event.path}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {event.label || "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {recentEvents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No website events found yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
