import Link from "next/link";
import { CalendarCheck, Download, FileText, MousePointerClick, Users } from "lucide-react";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportCard = {
  title: string;
  description: string;
  type: string;
  total: number;
};

function getLast30DaysIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

function DownloadCard({ report }: { report: ReportCard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{report.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold">{report.total}</p>
          <p className="text-sm text-muted-foreground">{report.description}</p>
        </div>

        <Link
          href={`/api/reports/export?type=${report.type}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function ReportsPage() {
  await requirePermission("reports.export");

  const supabase = await createClient();
  const last30Days = getLast30DaysIso();

  const [
    { count: leadsCount, error: leadsError },
    { count: customersCount, error: customersError },
    { count: appointmentsCount, error: appointmentsError },
    { count: websiteEventsCount, error: websiteEventsError },
    { count: last30EventsCount, error: last30EventsError },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase.from("website_events").select("id", { count: "exact", head: true }),
    supabase
      .from("website_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last30Days),
  ]);

  if (leadsError) throw new Error(leadsError.message);
  if (customersError) throw new Error(customersError.message);
  if (appointmentsError) throw new Error(appointmentsError.message);
  if (websiteEventsError) throw new Error(websiteEventsError.message);
  if (last30EventsError) throw new Error(last30EventsError.message);

  const reports: ReportCard[] = [
    {
      title: "Leads Report",
      description: "Names, phone numbers, sources, statuses, pages and UTM data.",
      type: "leads",
      total: leadsCount ?? 0,
    },
    {
      title: "Customers Report",
      description: "Customer contact details, tags, address and last seen date.",
      type: "customers",
      total: customersCount ?? 0,
    },
    {
      title: "Appointments Report",
      description: "Appointment date, time, status, source and notes.",
      type: "appointments",
      total: appointmentsCount ?? 0,
    },
    {
      title: "Website Events Report",
      description: "Raw page views, clicks, visitor ids, sessions and referrer data.",
      type: "website_events",
      total: websiteEventsCount ?? 0,
    },
    {
      title: "Traffic Sources Report",
      description: "Source-wise visitors, sessions, page views, clicks and lead rate.",
      type: "traffic_sources",
      total: websiteEventsCount ?? 0,
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Download business, CRM and website analytics data as CSV files.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{leadsCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">All time leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Appointments</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{appointmentsCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">All time appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Website Events</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{websiteEventsCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total tracked events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Last 30 Days</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{last30EventsCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Recent tracked events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <DownloadCard key={report.type} report={report} />
        ))}
      </div>
    </div>
  );
}
