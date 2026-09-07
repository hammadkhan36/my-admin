import type { ComponentType } from "react";
import {
  Activity,
  CalendarCheck,
  Clock,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
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

type AnalyticsRange = "today" | "7d" | "30d" | "90d" | "all";

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

const CONVERSION_EVENTS = new Set([
  "lead_submit",
  "appointment_submit",
  "coupon_validate",
  "coupon_redeem",
  "review_submit",
  "form_submit",
]);

const RANGE_OPTIONS: { value: AnalyticsRange; label: string; note: string }[] = [
  { value: "today", label: "Today", note: "Today" },
  { value: "7d", label: "7 Days", note: "Last 7 days" },
  { value: "30d", label: "30 Days", note: "Last 30 days" },
  { value: "90d", label: "90 Days", note: "Last 90 days" },
  { value: "all", label: "All", note: "All time" },
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const range = Array.isArray(value) ? value[0] : value;

  if (
    range === "today" ||
    range === "7d" ||
    range === "30d" ||
    range === "90d" ||
    range === "all"
  ) {
    return range;
  }

  return "30d";
}

function getRangeLabel(range: AnalyticsRange) {
  return RANGE_OPTIONS.find((option) => option.value === range)?.note ?? "Last 30 days";
}

function getRangeStartIso(range: AnalyticsRange) {
  const date = new Date();

  if (range === "all") return null;

  if (range === "today") {
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  date.setDate(date.getDate() - Number(range.replace("d", "")));
  return date.toISOString();
}

function countBy<T>(rows: T[], getValue: (row: T) => string | null | undefined) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = getValue(row)?.trim() || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(map: Record<string, number>, limit = 5, includeUnknown = false) {
  return Object.entries(map)
    .filter(([key]) => includeUnknown || key !== "unknown")
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

function getDayName(dateIso: string) {
  return DAY_NAMES[new Date(dateIso).getDay()];
}

function getHourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${suffix}`;
}

function getPeak<T>(rows: T[], getKey: (row: T) => string) {
  const entries = topEntries(countBy(rows, getKey), 1, true);
  return entries[0] ?? ["No data", 0];
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
  icon: ComponentType<{ className?: string }>;
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

function RankedList({
  title,
  empty,
  rows,
  total,
}: {
  title: string;
  empty: string;
  rows: [string, number][];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([label, count]) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm capitalize">{label}</p>
              <Badge variant="outline">{count}</Badge>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percentage(count, total)}%` }}
              />
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  await requirePermission("analytics.view");

  const selectedRange = getAnalyticsRange((await searchParams).range);
  const rangeStartIso = getRangeStartIso(selectedRange);
  const rangeLabel = getRangeLabel(selectedRange);
  const supabase = await createClient();

  let websiteEventsQuery = supabase
    .from("website_events")
    .select(
      "id, event_type, path, label, metadata, visitor_id, session_id, referrer_domain, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10000);

  let leadsQuery = supabase
    .from("leads")
    .select("id, source, status, created_at, page_url, utm_source")
    .order("created_at", { ascending: false });

  let appointmentsQuery = supabase
    .from("appointments")
    .select("id, status, source, created_at")
    .order("created_at", { ascending: false });

  if (rangeStartIso) {
    websiteEventsQuery = websiteEventsQuery.gte("created_at", rangeStartIso);
    leadsQuery = leadsQuery.gte("created_at", rangeStartIso);
    appointmentsQuery = appointmentsQuery.gte("created_at", rangeStartIso);
  }

  const [
    { data: websiteEvents, error: websiteEventsError },
    { data: leads, error: leadsError },
    { data: appointments, error: appointmentsError },
    { count: customersCount, error: customersError },
  ] = await Promise.all([
    websiteEventsQuery,
    leadsQuery,
    appointmentsQuery,
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
  const conversionEvents = eventRows.filter((event) =>
    CONVERSION_EVENTS.has(event.event_type)
  );

  const uniqueVisitors = new Set(
    eventRows.map((event) => event.visitor_id).filter(Boolean)
  ).size;

  const sessions = new Set(
    eventRows.map((event) => event.session_id).filter(Boolean)
  ).size;

  const approvedAppointments = appointmentRows.filter(
    (appointment) =>
      appointment.status === "approved" || appointment.status === "completed"
  ).length;

  const visitorToLeadRate = percentage(leadRows.length, uniqueVisitors);
  const leadToAppointmentRate = percentage(approvedAppointments, leadRows.length);
  const clickRate = percentage(clickEvents.length, pageViews.length);

  const topPages = topEntries(countBy(pageViews, (event) => event.path), 6);

  const topButtons = topEntries(
    countBy(clickEvents, (event) => event.label || formatEventType(event.event_type)),
    6
  );

  const trafficSources = topEntries(
    countBy(pageViews, getTrafficSource),
    6,
    true
  );

  const leadsBySource = topEntries(
    countBy(leadRows, (lead) => lead.utm_source || lead.source),
    6,
    true
  );

  const recentEvents = eventRows.slice(0, 10);

  const [peakDay, peakDayCount] = getPeak(pageViews, (event) =>
    getDayName(event.created_at)
  );

  const [peakHour, peakHourCount] = getPeak(pageViews, (event) =>
    getHourLabel(new Date(event.created_at).getHours())
  );

  const hourlyRows = Array.from({ length: 24 }, (_, hour) => {
    const label = getHourLabel(hour);

    const views = pageViews.filter(
      (event) => new Date(event.created_at).getHours() === hour
    ).length;

    const clicks = clickEvents.filter(
      (event) => new Date(event.created_at).getHours() === hour
    ).length;

    const leadsCount = leadRows.filter(
      (lead) => new Date(lead.created_at).getHours() === hour
    ).length;

    return {
      label,
      views,
      clicks,
      leads: leadsCount,
    };
  }).filter((row) => row.views || row.clicks || row.leads);

  const maxHourlyViews = Math.max(...hourlyRows.map((row) => row.views), 1);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              {rangeLabel} website performance: visitors, clicks, leads,
              bookings and peak time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => (
              <a
                key={option.value}
                href={`/analytics?range=${option.value}`}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  selectedRange === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Page Views"
          value={pageViews.length}
          note={`${rangeLabel} total visits`}
          icon={Eye}
        />

        <MetricCard
          title="Visitors"
          value={uniqueVisitors}
          note={`${sessions} tracked sessions`}
          icon={Users}
        />

        <MetricCard
          title="Clicks"
          value={clickEvents.length}
          note={`${clickRate}% click rate from page views`}
          icon={MousePointerClick}
        />

        <MetricCard
          title="Conversions"
          value={conversionEvents.length + leadRows.length + appointmentRows.length}
          note="Forms, leads, appointments, coupons and reviews"
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
          note="Total customer records"
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
          note="Approved/completed appointments from leads"
          icon={TrendingUp}
        />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Peak Time Insight
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Busiest Day</p>
              <p className="text-2xl font-bold">{peakDay}</p>
              <p className="text-xs text-muted-foreground">
                {peakDayCount} page views
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Busiest Hour</p>
              <p className="text-2xl font-bold">{peakHour}</p>
              <p className="text-xs text-muted-foreground">
                {peakHourCount} page views
              </p>
            </div>
          </CardContent>
        </Card>

        <RankedList
          title="Top Pages"
          empty="No page views tracked yet."
          rows={topPages}
          total={pageViews.length}
        />

        <RankedList
          title="Top Buttons"
          empty="No button clicks tracked yet."
          rows={topButtons}
          total={clickEvents.length}
        />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <RankedList
          title="Traffic Sources"
          empty="No traffic source data yet."
          rows={trafficSources}
          total={pageViews.length}
        />

        <RankedList
          title="Lead Sources"
          empty="No leads found yet."
          rows={leadsBySource}
          total={leadRows.length}
        />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hourly Activity</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Leads</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {hourlyRows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="whitespace-nowrap">
                      {row.label}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${percentage(row.views, maxHourlyViews)}%`,
                            }}
                          />
                        </div>
                        {row.views}
                      </div>
                    </TableCell>

                    <TableCell>{row.clicks}</TableCell>
                    <TableCell>{row.leads}</TableCell>
                  </TableRow>
                ))}

                {hourlyRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No hourly activity yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
                      <Badge variant="outline">
                        {formatEventType(event.event_type)}
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-[180px] truncate">
                      {event.path}
                    </TableCell>

                    <TableCell className="max-w-[180px] truncate">
                      {event.label || "-"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
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