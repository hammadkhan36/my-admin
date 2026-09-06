

import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

function countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = String(row[key] || "unknown");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getLast30DaysIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

export default async function AnalyticsPage() {
  await requirePermission("analytics.view");

  const supabase = await createClient();
  const last30Days = getLast30DaysIso();

  const [
    { data: leads, error: leadsError },
    { data: appointments, error: appointmentsError },
    { count: customersCount },
  ] = await Promise.all([
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

  if (leadsError) throw new Error(leadsError.message);
  if (appointmentsError) throw new Error(appointmentsError.message);

  const leadRows = (leads ?? []) as LeadRow[];
  const appointmentRows = (appointments ?? []) as AppointmentRow[];

  const leadsBySource = countBy(leadRows, "source");
  const leadsByStatus = countBy(leadRows, "status");
  const appointmentsByStatus = countBy(appointmentRows, "status");

  const websiteLeads = leadRows.filter((lead) => lead.source === "website").length;
  const manualLeads = leadRows.filter((lead) => lead.source === "manual").length;
  const approvedAppointments = appointmentRows.filter(
    (appointment) => appointment.status === "approved" || appointment.status === "completed"
  ).length;

  const conversionRate = percentage(approvedAppointments, leadRows.length);

  const topPages = Object.entries(countBy(leadRows, "page_url"))
    .filter(([page]) => page !== "unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topUtmSources = Object.entries(countBy(leadRows, "utm_source"))
    .filter(([source]) => source !== "unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Last 30 days overview for leads, customers, appointments and website tracking.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{leadRows.length}</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customersCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{appointmentRows.length}</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lead to Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Basic conversion</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(leadsBySource).map(([source, count]) => (
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

            {leadRows.length === 0 && (
              <p className="text-sm text-muted-foreground">No leads found yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appointment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(appointmentsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium capitalize">
                  {status.replace("_", " ")}
                </p>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}

            {appointmentRows.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No appointments found yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(leadsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium capitalize">
                  {status.replace("_", " ")}
                </p>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}

            {leadRows.length === 0 && (
              <p className="text-sm text-muted-foreground">No lead status data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Split</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Website Leads</p>
              <p className="text-2xl font-bold text-blue-600">{websiteLeads}</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Manual Leads</p>
              <p className="text-2xl font-bold text-emerald-600">{manualLeads}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Lead Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPages.map(([page, count]) => (
              <div key={page} className="flex items-center justify-between gap-3">
                <p className="truncate text-sm">{page}</p>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}

            {topPages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Page tracking data will show after website leads.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top UTM Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topUtmSources.map(([source, count]) => (
              <div key={source} className="flex items-center justify-between gap-3">
                <p className="truncate text-sm capitalize">{source}</p>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}

            {topUtmSources.length === 0 && (
              <p className="text-sm text-muted-foreground">
                UTM source data will show after tracked leads.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}