// // "use client";

// // import { useState } from "react";
// // import { websiteAnalytics, leadAnalytics, marketingAnalytics, trafficSources, topPages, landingPages } from "@/lib/analytics-data";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
// // import { Users, Activity, Eye, MousePointer, TrendingUp, Share2 } from "lucide-react";

// // export default function AnalyticsDashboardPage() {
// //   const [dateRange, setDateRange] = useState("30d");

// //   const ranges = ["7d", "30d", "90d", "custom"];

// //   // Prepare data for traffic sources bar chart
// //   const trafficChartData = trafficSources.map((t) => ({
// //     source: t.source,
// //     visitors: t.visitors,
// //   }));

// //   return (
// //     <div className="p-4 md:p-6">
// //       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
// //         <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
// //         <div className="flex gap-2">
// //           {ranges.map((range) => (
// //             <Button
// //               key={range}
// //               variant={dateRange === range ? "default" : "outline"}
// //               size="sm"
// //               onClick={() => setDateRange(range)}
// //             >
// //               {range === "custom" ? "Custom" : range.toUpperCase()}
// //             </Button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Website Analytics Stats */}
// //       <h2 className="text-lg font-semibold mb-4">Website Analytics</h2>
// //       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
// //         <Card>
// //           <CardHeader className="flex flex-row items-center justify-between pb-2">
// //             <CardTitle className="text-sm font-medium">Visitors</CardTitle>
// //             <Users className="h-4 w-4 text-muted-foreground" />
// //           </CardHeader>
// //           <CardContent>
// //             <p className="text-2xl font-bold">{websiteAnalytics.visitors.toLocaleString()}</p>
// //           </CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="flex flex-row items-center justify-between pb-2">
// //             <CardTitle className="text-sm font-medium">Sessions</CardTitle>
// //             <Activity className="h-4 w-4 text-muted-foreground" />
// //           </CardHeader>
// //           <CardContent>
// //             <p className="text-2xl font-bold">{websiteAnalytics.sessions.toLocaleString()}</p>
// //           </CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="flex flex-row items-center justify-between pb-2">
// //             <CardTitle className="text-sm font-medium">Page Views</CardTitle>
// //             <Eye className="h-4 w-4 text-muted-foreground" />
// //           </CardHeader>
// //           <CardContent>
// //             <p className="text-2xl font-bold">{websiteAnalytics.pageViews.toLocaleString()}</p>
// //           </CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="flex flex-row items-center justify-between pb-2">
// //             <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
// //             <MousePointer className="h-4 w-4 text-muted-foreground" />
// //           </CardHeader>
// //           <CardContent>
// //             <p className="text-2xl font-bold">{websiteAnalytics.avgSessionDuration}</p>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* Lead Analytics */}
// //       <h2 className="text-lg font-semibold mb-4">Lead Analytics</h2>
// //       <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Leads</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{leadAnalytics.leads}</p></CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Conversion Rate</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{leadAnalytics.conversionRate}%</p></CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Quote Requests</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{leadAnalytics.quoteRequests}</p></CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">WhatsApp Clicks</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{leadAnalytics.whatsappClicks}</p></CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Call Clicks</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{leadAnalytics.callClicks}</p></CardContent>
// //         </Card>
// //       </div>

// //       {/* Marketing Analytics */}
// //       <h2 className="text-lg font-semibold mb-4">Marketing Analytics</h2>
// //       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Campaigns</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{marketingAnalytics.campaigns}</p></CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Coupons</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{marketingAnalytics.coupons}</p></CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Referrals</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{marketingAnalytics.referrals}</p></CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Traffic Sources</CardTitle></CardHeader>
// //           <CardContent><p className="text-2xl font-bold">{marketingAnalytics.trafficSources}</p></CardContent>
// //         </Card>
// //       </div>

// //       {/* Top Pages & Landing Pages */}
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
// //         <Card>
// //           <CardHeader>
// //             <CardTitle>Top Pages</CardTitle>
// //             <CardDescription>Most visited pages</CardDescription>
// //           </CardHeader>
// //           <CardContent>
// //             <ul className="space-y-2">
// //               {topPages.map((page) => (
// //                 <li key={page.page} className="flex justify-between text-sm">
// //                   <span>{page.page}</span>
// //                   <span className="font-medium">{page.views.toLocaleString()} views</span>
// //                 </li>
// //               ))}
// //             </ul>
// //           </CardContent>
// //         </Card>
// //         <Card>
// //           <CardHeader>
// //             <CardTitle>Landing Pages</CardTitle>
// //             <CardDescription>Pages that generate leads</CardDescription>
// //           </CardHeader>
// //           <CardContent>
// //             <ul className="space-y-2">
// //               {landingPages.map((page) => (
// //                 <li key={page.page} className="flex justify-between text-sm">
// //                   <span>{page.page}</span>
// //                   <span className="font-medium">{page.leads} leads ({page.conversionRate}%)</span>
// //                 </li>
// //               ))}
// //             </ul>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* Traffic Sources Bar Chart */}
// //       <Card className="mb-6">
// //         <CardHeader>
// //           <CardTitle>Traffic Sources Overview</CardTitle>
// //           <CardDescription>Visitors by source (selected range)</CardDescription>
// //         </CardHeader>
// //         <CardContent>
// //           <div className="h-[300px]">
// //             <ResponsiveContainer width="100%" height="100%">
// //               <BarChart data={trafficChartData}>
// //                 <CartesianGrid strokeDasharray="3 3" />
// //                 <XAxis dataKey="source" tick={{ fontSize: 12 }} />
// //                 <YAxis tick={{ fontSize: 12 }} />
// //                 <Tooltip />
// //                 <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
// //               </BarChart>
// //             </ResponsiveContainer>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }



// "use client";

// import * as React from "react";
// import { createClient } from "@/lib/supabase-browser";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
// import { Users, UserPlus, TrendingUp, MousePointer, Percent } from "lucide-react";

// export default function AnalyticsPage() {
//   const supabase = createClient();
//   const [loading, setLoading] = React.useState(true);
//   const [dateRange, setDateRange] = React.useState("30d");
//   const [leadCount, setLeadCount] = React.useState(0);
//   const [customerCount, setCustomerCount] = React.useState(0);
//   const [conversionRate, setConversionRate] = React.useState(0);
//   const [sourceData, setSourceData] = React.useState([]);
//   const [leadTypeData, setLeadTypeData] = React.useState([]);
//   const [statusData, setStatusData] = React.useState([]);

//   React.useEffect(() => {
//     fetchAnalytics();
//   }, [dateRange]);

//   const fetchAnalytics = async () => {
//     setLoading(true);

//     // Date filter
//     let startDate = new Date();
//     if (dateRange === "7d") startDate.setDate(startDate.getDate() - 7);
//     else if (dateRange === "30d") startDate.setDate(startDate.getDate() - 30);
//     else if (dateRange === "90d") startDate.setDate(startDate.getDate() - 90);
//     else startDate = new Date("2020-01-01"); // all time

//     const startISO = startDate.toISOString();

//     // Fetch leads
//     const { data: leads, error: leadsError } = await supabase
//       .from("leads")
//       .select("id, source, lead_type, status, created_at")
//       .gte("created_at", startISO);
//     if (leadsError) {
//       console.error(leadsError);
//       setLoading(false);
//       return;
//     }

//     // Fetch customers count
//     const { count: customers, error: custError } = await supabase
//       .from("customers")
//       .select("id", { count: "exact", head: true })
//       .gte("created_at", startISO);
//     if (custError) console.error(custError);

//     // Calculate metrics
//     const totalLeads = leads.length;
//     setLeadCount(totalLeads);
//     setCustomerCount(customers || 0);
//     const conversion = totalLeads > 0 ? (customers || 0) / totalLeads * 100 : 0;
//     setConversionRate(Number(conversion.toFixed(2)));

//     // Source distribution
//     const sourceMap: Record<string, number> = {};
//     leads.forEach((lead) => {
//       sourceMap[lead.source] = (sourceMap[lead.source] || 0) + 1;
//     });
//     const sourceChartData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));
//     setSourceData(sourceChartData as any);

//     // Lead type distribution
//     const typeMap: Record<string, number> = {};
//     leads.forEach((lead) => {
//       typeMap[lead.lead_type] = (typeMap[lead.lead_type] || 0) + 1;
//     });
//     const typeChartData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
//     setLeadTypeData(typeChartData as any);

//     // Status distribution
//     const statusMap: Record<string, number> = {};
//     leads.forEach((lead) => {
//       statusMap[lead.status] = (statusMap[lead.status] || 0) + 1;
//     });
//     const statusChartData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
//     setStatusData(statusChartData as any);

//     setLoading(false);
//   };

//   const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
//         <div className="flex gap-2">
//           <Select value={dateRange} onValueChange={(value) => setDateRange(value ?? "all")}>
//             <SelectTrigger className="w-[140px]">
//               <SelectValue placeholder="Date Range" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="7d">Last 7 days</SelectItem>
//               <SelectItem value="30d">Last 30 days</SelectItem>
//               <SelectItem value="90d">Last 90 days</SelectItem>
//               <SelectItem value="all">All time</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent><p className="text-2xl font-bold">{leadCount}</p></CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Customers</CardTitle>
//             <UserPlus className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent><p className="text-2xl font-bold">{customerCount}</p></CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
//             <Percent className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent><p className="text-2xl font-bold">{conversionRate}%</p></CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Avg. Leads/Day</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">
//               {dateRange === "7d" ? (leadCount / 7).toFixed(1) :
//                dateRange === "30d" ? (leadCount / 30).toFixed(1) :
//                dateRange === "90d" ? (leadCount / 90).toFixed(1) :
//                "—"}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Leads by Source</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-72">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={sourceData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="value" fill="#2563eb" radius={[4,4,0,0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Leads by Type</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-72">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie data={leadTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
//                     {leadTypeData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Lead Status Distribution</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-72">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={statusData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis allowDecimals={false} />
//                 <Tooltip />
//                 <Bar dataKey="value" fill="#10b981" radius={[4,4,0,0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }









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