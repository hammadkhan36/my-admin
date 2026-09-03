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

  if (!["leads", "customers", "appointments"].includes(type)) {
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