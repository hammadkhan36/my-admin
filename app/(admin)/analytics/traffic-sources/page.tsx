import { ExternalLink, MousePointerClick, TrendingUp, Users } from "lucide-react";
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

type AnalyticsRange = "7d" | "30d" | "90d" | "all";

type WebsiteEventRow = {
  id: string;
  event_type: string;
  path: string;
  metadata: Record<string, unknown> | null;
  visitor_id: string | null;
  session_id: string | null;
  referrer_domain: string | null;
  created_at: string;
};

type LeadRow = {
  id: string;
  source: string | null;
  utm_source: string | null;
  page_url: string | null;
  created_at: string;
};

type SourceStats = {
  source: string;
  visitors: Set<string>;
  sessions: Set<string>;
  pageViews: number;
  clicks: number;
  leads: number;
  topPage: string;
  pages: Record<string, number>;
};

const CLICK_EVENTS = new Set([
  "call_click",
  "whatsapp_click",
  "map_click",
  "booking_click",
]);

const RANGE_OPTIONS: { value: AnalyticsRange; label: string; note: string }[] = [
  { value: "7d", label: "7 Days", note: "Last 7 days" },
  { value: "30d", label: "30 Days", note: "Last 30 days" },
  { value: "90d", label: "90 Days", note: "Last 90 days" },
  { value: "all", label: "All", note: "All time" },
];

function getAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const range = Array.isArray(value) ? value[0] : value;

  if (range === "7d" || range === "30d" || range === "90d" || range === "all") {
    return range;
  }

  return "30d";
}

function getRangeLabel(range: AnalyticsRange) {
  return RANGE_OPTIONS.find((option) => option.value === range)?.note ?? "Last 30 days";
}

function getRangeStartIso(range: AnalyticsRange) {
  if (range === "all") return null;

  const date = new Date();
  date.setDate(date.getDate() - Number(range.replace("d", "")));
  return date.toISOString();
}

function getUtmSource(metadata: Record<string, unknown> | null) {
  const source = metadata?.utm_source;
  return typeof source === "string" && source.trim() ? source.trim() : null;
}

function getTrafficSource(event: WebsiteEventRow) {
  return getUtmSource(event.metadata) || event.referrer_domain || "Direct";
}

function getLeadSource(lead: LeadRow) {
  return lead.utm_source || lead.source || "unknown";
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getOrCreateSource(map: Map<string, SourceStats>, source: string) {
  const existing = map.get(source);

  if (existing) return existing;

  const created: SourceStats = {
    source,
    visitors: new Set(),
    sessions: new Set(),
    pageViews: 0,
    clicks: 0,
    leads: 0,
    topPage: "-",
    pages: {},
  };

  map.set(source, created);
  return created;
}

function topPageFromPages(pages: Record<string, number>) {
  return Object.entries(pages).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
}

export default async function TrafficSourcesPage({
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
    .select("id, event_type, path, metadata, visitor_id, session_id, referrer_domain, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  let leadsQuery = supabase
    .from("leads")
    .select("id, source, utm_source, page_url, created_at")
    .order("created_at", { ascending: false });

  if (rangeStartIso) {
    websiteEventsQuery = websiteEventsQuery.gte("created_at", rangeStartIso);
    leadsQuery = leadsQuery.gte("created_at", rangeStartIso);
  }

  const [
    { data: websiteEvents, error: websiteEventsError },
    { data: leads, error: leadsError },
  ] = await Promise.all([websiteEventsQuery, leadsQuery]);

  if (websiteEventsError) throw new Error(websiteEventsError.message);
  if (leadsError) throw new Error(leadsError.message);

  const eventRows = (websiteEvents ?? []) as WebsiteEventRow[];
  const leadRows = (leads ?? []) as LeadRow[];
  const sourceMap = new Map<string, SourceStats>();

  for (const event of eventRows) {
    const source = getTrafficSource(event);
    const stats = getOrCreateSource(sourceMap, source);

    if (event.visitor_id) stats.visitors.add(event.visitor_id);
    if (event.session_id) stats.sessions.add(event.session_id);

    if (event.event_type === "page_view") {
      stats.pageViews += 1;
      stats.pages[event.path] = (stats.pages[event.path] || 0) + 1;
    }

    if (CLICK_EVENTS.has(event.event_type)) {
      stats.clicks += 1;
    }
  }

  for (const lead of leadRows) {
    const stats = getOrCreateSource(sourceMap, getLeadSource(lead));
    stats.leads += 1;

    if (lead.page_url) {
      stats.pages[lead.page_url] = (stats.pages[lead.page_url] || 0) + 1;
    }
  }

  const sources = Array.from(sourceMap.values())
    .map((source) => ({
      ...source,
      visitorCount: source.visitors.size,
      sessionCount: source.sessions.size,
      conversionRate: percentage(source.leads, source.visitors.size),
      topPage: topPageFromPages(source.pages),
    }))
    .sort((a, b) => b.pageViews + b.clicks + b.leads - (a.pageViews + a.clicks + a.leads));

  const totalVisitors = new Set(eventRows.map((event) => event.visitor_id).filter(Boolean)).size;
  const totalPageViews = eventRows.filter((event) => event.event_type === "page_view").length;
  const totalClicks = eventRows.filter((event) => CLICK_EVENTS.has(event.event_type)).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold">Traffic Sources</h1>
          <p className="text-sm text-muted-foreground">
            {rangeLabel} source report from website visits, referrers, UTM tags and leads.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <a
              key={option.value}
              href={`/analytics/traffic-sources?range=${option.value}`}
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

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalVisitors}</p>
            <p className="text-xs text-muted-foreground">{rangeLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Page Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPageViews}</p>
            <p className="text-xs text-muted-foreground">Visits from all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalClicks}</p>
            <p className="text-xs text-muted-foreground">Call, WhatsApp, map, booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Sources</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sources.length}</p>
            <p className="text-xs text-muted-foreground">Direct, referrals and campaigns</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Visitors</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Page Views</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Lead Rate</TableHead>
              <TableHead>Top Page</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.source}>
                <TableCell className="font-medium capitalize">{source.source}</TableCell>
                <TableCell>{source.visitorCount}</TableCell>
                <TableCell>{source.sessionCount}</TableCell>
                <TableCell>{source.pageViews}</TableCell>
                <TableCell>{source.clicks}</TableCell>
                <TableCell>{source.leads}</TableCell>
                <TableCell>
                  <Badge variant="outline">{source.conversionRate}%</Badge>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">{source.topPage}</TableCell>
              </TableRow>
            ))}

            {sources.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No traffic source data found yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
