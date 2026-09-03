// // app/(dashboard)/dashboard/page.tsx
// import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
// import { StatsCards } from "@/components/dashboard/stats-cards";
// import { LeadsOverviewChart } from "@/components/dashboard/leads-overview-chart";
// import { LeadSourcesChart } from "@/components/dashboard/lead-sources-chart";
// import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
// import { TopServices } from "@/components/dashboard/top-services";
// import { RecentLeads } from "@/components/dashboard/recent-leads";
// import { RecentActivity } from "@/components/dashboard/recent-activity";

// export default function DashboardPage() {
//   return (
//     <div className="@container/main flex flex-1 flex-col gap-2">
//       <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
//         {/* Header + Date Range */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <h2 className="text-2xl font-bold">Dashboard Overview</h2>
//             <p className="text-muted-foreground">Monitor your business performance</p>
//           </div>
//           <DateRangeFilter />
//         </div>

//         {/* Stats Cards */}
//         <StatsCards />

//         {/* Charts Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           <div className="lg:col-span-2">
//             <LeadsOverviewChart />
//           </div>
//           <LeadSourcesChart />
//         </div>

//         {/* Conversion Funnel & Top Services */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           <ConversionFunnel />
//           <TopServices />
//         </div>

//         {/* Recent Leads & Activity */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           <div className="lg:col-span-2">
//             <RecentLeads />
//           </div>
//           <RecentActivity />
//         </div>
//       </div>
//     </div>
//   );
// }

















import Link from "next/link";
import { CalendarClock, Users, UserPlus, Bell, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

function getActorName(profile: ActivityRow["profiles"]) {
  const actor = Array.isArray(profile) ? profile[0] : profile;
  return actor?.full_name || actor?.email || "System";
}

function readableEvent(eventType: string) {
  return eventType.replaceAll("_", " ").replaceAll(".", " ");
}

export default async function DashboardPage() {
  await requirePermission("dashboard.view");

  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: leadsCount },
    { count: customersCount },
    { count: appointmentsCount },
    { count: pendingAppointmentsCount },
    { count: todayLeadsCount },
    { count: unreadNotificationsCount },
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
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
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

  const activities = (recentActivity ?? []) as ActivityRow[];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live overview of leads, customers, appointments and team activity.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/crm/leads">
          <Card className="transition hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="text-2xl font-bold">{leadsCount ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/crm/customers">
          <Card className="transition hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Customers</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent className="text-2xl font-bold">{customersCount ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/appointments">
          <Card className="transition hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Appointments</CardTitle>
              <CalendarClock className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent className="text-2xl font-bold">{appointmentsCount ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/crm/notifications">
          <Card className="transition hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Unread Notifications</CardTitle>
              <Bell className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {unreadNotificationsCount ?? 0}
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">New Leads Today</p>
              <p className="text-2xl font-bold text-blue-600">{todayLeadsCount ?? 0}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Pending Appointments</p>
              <p className="text-2xl font-bold text-amber-600">
                {pendingAppointmentsCount ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
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
      </div>

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
              className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium capitalize">
                  {readableEvent(activity.event_type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getActorName(activity.profiles)}
                </p>
              </div>

              <Badge variant="outline">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </Badge>
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
  );
}