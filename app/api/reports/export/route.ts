import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);

  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

const CLICK_EVENTS = new Set([
  "call_click",
  "whatsapp_click",
  "map_click",
  "booking_click",
]);

type WebsiteEventExportRow = {
  event_type: string;
  path: string;
  label: string | null;
  metadata: Record<string, unknown> | null;
  visitor_id: string | null;
  session_id: string | null;
  referrer_domain: string | null;
};

type LeadExportRow = {
  source: string | null;
  utm_source: string | null;
};

function getUtmSource(metadata: Record<string, unknown> | null) {
  const source = metadata?.utm_source;
  return typeof source === "string" && source.trim() ? source.trim() : null;
}

function getEventSource(event: WebsiteEventExportRow) {
  return getUtmSource(event.metadata) || event.referrer_domain || "Direct";
}

function getLeadSource(lead: LeadExportRow) {
  return lead.utm_source || lead.source || "unknown";
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export async function GET(request: NextRequest) {
  await requirePermission("reports.export");

  const supabase = await createClient();
  const type = request.nextUrl.searchParams.get("type") || "leads";

  let rows: Record<string, unknown>[] = [];

  if (type === "leads") {
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, phone, email, service, source, status, page_url, utm_source, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    rows = (data ?? []) as Record<string, unknown>[];
  }

  if (type === "customers") {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone, email, address, tags, last_seen_at, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    rows = (data ?? []) as Record<string, unknown>[];
  }

  if (type === "appointments") {
    const { data, error } = await supabase
      .from("appointments")
      .select("id, customer_name, customer_phone, customer_email, appointment_date, appointment_time, status, source, notes, created_at")
      .order("appointment_date", { ascending: false });

    if (error) throw new Error(error.message);
    rows = (data ?? []) as Record<string, unknown>[];
  }

  if (type === "website_events") {
    const { data, error } = await supabase
      .from("website_events")
      .select("event_type, path, label, visitor_id, session_id, referrer_domain, metadata, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    rows = (data ?? []) as Record<string, unknown>[];
  }

  if (type === "traffic_sources") {
    const [
      { data: events, error: eventsError },
      { data: leads, error: leadsError },
    ] = await Promise.all([
      supabase
        .from("website_events")
        .select("event_type, path, label, metadata, visitor_id, session_id, referrer_domain")
        .order("created_at", { ascending: false })
        .limit(10000),
      supabase
        .from("leads")
        .select("source, utm_source")
        .order("created_at", { ascending: false }),
    ]);

    if (eventsError) throw new Error(eventsError.message);
    if (leadsError) throw new Error(leadsError.message);

    const sourceMap = new Map<
      string,
      {
        visitors: Set<string>;
        sessions: Set<string>;
        pageViews: number;
        clicks: number;
        leads: number;
      }
    >();

    const getSource = (source: string) => {
      const existing = sourceMap.get(source);

      if (existing) return existing;

      const created = {
        visitors: new Set<string>(),
        sessions: new Set<string>(),
        pageViews: 0,
        clicks: 0,
        leads: 0,
      };

      sourceMap.set(source, created);
      return created;
    };

    for (const event of (events ?? []) as WebsiteEventExportRow[]) {
      const source = getSource(getEventSource(event));

      if (event.visitor_id) source.visitors.add(event.visitor_id);
      if (event.session_id) source.sessions.add(event.session_id);
      if (event.event_type === "page_view") source.pageViews += 1;
      if (CLICK_EVENTS.has(event.event_type)) source.clicks += 1;
    }

    for (const lead of (leads ?? []) as LeadExportRow[]) {
      getSource(getLeadSource(lead)).leads += 1;
    }

    rows = Array.from(sourceMap.entries())
      .map(([source, stats]) => ({
        source,
        visitors: stats.visitors.size,
        sessions: stats.sessions.size,
        page_views: stats.pageViews,
        clicks: stats.clicks,
        leads: stats.leads,
        lead_rate: `${percentage(stats.leads, stats.visitors.size)}%`,
      }))
      .sort((a, b) => Number(b.page_views) - Number(a.page_views));
  }

  if (!["leads", "customers", "appointments", "website_events", "traffic_sources"].includes(type)) {
    return NextResponse.json(
      { success: false, error: "Invalid report type." },
      { status: 400 }
    );
  }

  await logActivity({
    eventType: "report.exported",
    targetType: "report",
    details: { type, rows: rows.length },
  });

  const csv = toCsv(rows);
  const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
