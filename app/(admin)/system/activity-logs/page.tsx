// // "use client";

// // import { useState } from "react";
// // import { activityLogs } from "@/lib/system-data";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Badge } from "@/components/ui/badge";
// // import { Card, CardContent } from "@/components/ui/card";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Search, Filter } from "lucide-react";

// // export default function ActivityLogsPage() {
// //   const [search, setSearch] = useState("");
// //   const [userFilter, setUserFilter] = useState("all");
// //   const [moduleFilter, setModuleFilter] = useState("all");
// //   const [actionFilter, setActionFilter] = useState("all");

// //   const filtered = activityLogs.filter((log) => {
// //     const matchesSearch =
// //       log.user.toLowerCase().includes(search.toLowerCase()) ||
// //       log.details.toLowerCase().includes(search.toLowerCase());
// //     const matchesUser = userFilter === "all" || log.user === userFilter;
// //     const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
// //     const matchesAction = actionFilter === "all" || log.action === actionFilter;
// //     return matchesSearch && matchesUser && matchesModule && matchesAction;
// //   });

// //   const users = Array.from(new Set(activityLogs.map((log) => log.user)));
// //   const modules = Array.from(new Set(activityLogs.map((log) => log.module)));
// //   const actions = Array.from(new Set(activityLogs.map((log) => log.action)));

// //   return (
// //     <div className="p-4 md:p-6">
// //       <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>

// //       {/* Filters */}
// //       <div className="flex flex-col md:flex-row gap-4 mb-4">
// //         <div className="relative flex-1">
// //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //           <Input
// //             placeholder="Search logs..."
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //             className="pl-10"
// //           />
// //         </div>
// //         <Select
// //           value={userFilter}
// //           onValueChange={(value) => setUserFilter(value ?? "all")}
// //         >
// //           <SelectTrigger className="w-[160px]">
// //             <SelectValue placeholder="User" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="all">All Users</SelectItem>
// //             {users.map((user) => (
// //               <SelectItem key={user} value={user}>{user}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //         <Select
// //           value={moduleFilter}
// //           onValueChange={(value) => setModuleFilter(value ?? "all")}
// //         >
// //           <SelectTrigger className="w-[160px]">
// //             <SelectValue placeholder="Module" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="all">All Modules</SelectItem>
// //             {modules.map((module) => (
// //               <SelectItem key={module} value={module}>{module}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //         <Select
// //           value={actionFilter}
// //           onValueChange={(value) => setActionFilter(value ?? "all")}
// //         >
// //           <SelectTrigger className="w-[160px]">
// //             <SelectValue placeholder="Action" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="all">All Actions</SelectItem>
// //             {actions.map((action) => (
// //               <SelectItem key={action} value={action}>{action}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //       </div>

// //       {/* Logs Table */}
// //       <div className="rounded-xl border bg-card">
// //         <Table>
// //           <TableHeader>
// //             <TableRow>
// //               <TableHead>User</TableHead>
// //               <TableHead>Action</TableHead>
// //               <TableHead>Module</TableHead>
// //               <TableHead>Details</TableHead>
// //               <TableHead>Date/Time</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {filtered.map((log) => (
// //               <TableRow key={log.id}>
// //                 <TableCell className="font-medium">{log.user}</TableCell>
// //                 <TableCell>{log.action}</TableCell>
// //                 <TableCell>
// //                   <Badge variant="outline">{log.module}</Badge>
// //                 </TableCell>
// //                 <TableCell>{log.details}</TableCell>
// //                 <TableCell>{log.dateTime}</TableCell>
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //       </div>
// //     </div>
// //   );
// // }





// "use client";

// import * as React from "react";
// import { createClient } from "@/lib/supabase-browser";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Search,
//   Filter,
//   CalendarClock,
//   User,
//   Settings,
//   Clock,
// } from "lucide-react";
// import { format } from "date-fns";

// type Activity = {
//   id: string;
//   actor_type: string | null;
//   activity_type: string;
//   description: string;
//   metadata: any;
//   created_at: string;
//   customer_id: string | null;
//   appointment_id: string | null;
//   lead_id: string | null;
// };

// export default function ActivityLogsPage() {
//   const supabase = createClient();
//   const [activities, setActivities] = React.useState<Activity[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [search, setSearch] = React.useState("");
//   const [actorFilter, setActorFilter] = React.useState("all");
//   const [moduleFilter, setModuleFilter] = React.useState("all");
//   const [dateFilter, setDateFilter] = React.useState("all"); // "today", "yesterday", "7d", "30d", "all"

//   React.useEffect(() => {
//     fetchActivities();
//   }, []);

//   const fetchActivities = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("activities")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(200);

//     if (!error && data) {
//       setActivities(data as Activity[]);
//     }
//     setLoading(false);
//   };

//   // Derive module from activity_type
//   const getModuleFromType = (type: string): string => {
//     if (type.startsWith("appointment")) return "Appointments";
//     if (type.startsWith("lead")) return "Leads";
//     if (type.startsWith("customer")) return "Customers";
//     if (type.startsWith("review")) return "Reviews";
//     if (type.startsWith("coupon")) return "Coupons";
//     if (type.startsWith("campaign")) return "Marketing";
//     if (type.startsWith("offer")) return "Offers";
//     if (type.startsWith("referral")) return "Referrals";
//     return "System";
//   };

//   // Filter activities
//   const filtered = activities.filter((act) => {
//     const matchesSearch =
//       act.description.toLowerCase().includes(search.toLowerCase()) ||
//       act.activity_type.toLowerCase().includes(search.toLowerCase());
//     const matchesActor =
//       actorFilter === "all" || (act.actor_type || "unknown") === actorFilter;
//     const matchesModule =
//       moduleFilter === "all" || getModuleFromType(act.activity_type) === moduleFilter;

//     // Date filter
//     if (dateFilter !== "all") {
//       const now = new Date();
//       const createdAt = new Date(act.created_at);
//       const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
//       if (dateFilter === "today" && diffDays !== 0) return false;
//       if (dateFilter === "yesterday" && diffDays !== 1) return false;
//       if (dateFilter === "7d" && diffDays > 7) return false;
//       if (dateFilter === "30d" && diffDays > 30) return false;
//     }

//     return matchesSearch && matchesActor && matchesModule;
//   });

//   const getActorIcon = (actorType: string | null) => {
//     switch (actorType) {
//       case "admin":
//         return <User className="h-4 w-4" />;
//       case "system":
//         return <Settings className="h-4 w-4" />;
//       case "customer":
//         return <Clock className="h-4 w-4" />;
//       default:
//         return <CalendarClock className="h-4 w-4" />;
//     }
//   };

//   const actorTypes = ["all", "admin", "customer", "system"];
//   const modules = [
//     "all",
//     "Appointments",
//     "Leads",
//     "Customers",
//     "Reviews",
//     "Coupons",
//     "Marketing",
//     "Offers",
//     "Referrals",
//     "System",
//   ];

//   if (loading) {
//     return (
//       <div className="p-4 md:p-6">
//         <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>
//         <div className="space-y-4">
//           <div className="h-10 bg-muted rounded animate-pulse" />
//           <div className="h-64 bg-muted rounded animate-pulse" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6">
//       <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>

//       {/* Filters */}
//       <div className="flex flex-col md:flex-row gap-4 mb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search activities..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Select
//           value={actorFilter}
//           onValueChange={(value) => setActorFilter(value ?? "all")}
//         >
//           <SelectTrigger className="w-[150px]">
//             <SelectValue placeholder="Actor" />
//           </SelectTrigger>
//           <SelectContent>
//             {actorTypes.map((type) => (
//               <SelectItem key={type} value={type}>
//                 {type === "all" ? "All Actors" : type}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select
//           value={moduleFilter}
//           onValueChange={(value) => setModuleFilter(value ?? "all")}
//         >
//           <SelectTrigger className="w-[170px]">
//             <SelectValue placeholder="Module" />
//           </SelectTrigger>
//           <SelectContent>
//             {modules.map((mod) => (
//               <SelectItem key={mod} value={mod}>
//                 {mod === "all" ? "All Modules" : mod}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select
//           value={dateFilter}
//           onValueChange={(value) => setDateFilter(value ?? "all")}
//         >
//           <SelectTrigger className="w-[140px]">
//             <SelectValue placeholder="Date" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Dates</SelectItem>
//             <SelectItem value="today">Today</SelectItem>
//             <SelectItem value="yesterday">Yesterday</SelectItem>
//             <SelectItem value="7d">Last 7 days</SelectItem>
//             <SelectItem value="30d">Last 30 days</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Table */}
//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Actor</TableHead>
//                 <TableHead>Module</TableHead>
//                 <TableHead>Activity</TableHead>
//                 <TableHead>Details</TableHead>
//                 <TableHead>Date/Time</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
//                     No activities found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filtered.map((act) => (
//                   <TableRow key={act.id}>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         {getActorIcon(act.actor_type)}
//                         <span className="text-sm capitalize">{act.actor_type || "unknown"}</span>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="outline">{getModuleFromType(act.activity_type)}</Badge>
//                     </TableCell>
//                     <TableCell className="font-medium">{act.description}</TableCell>
//                     <TableCell>
//                       <span className="text-xs text-muted-foreground">
//                         {act.metadata && Object.keys(act.metadata).length > 0
//                           ? Object.entries(act.metadata)
//                               .map(([key, value]) => `${key}: ${String(value)}`)
//                               .join(", ")
//                           : "-"}
//                       </span>
//                     </TableCell>
//                     <TableCell className="text-muted-foreground">
//                       {format(new Date(act.created_at), "PPpp")}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }












import { formatDistanceToNow } from "date-fns";
import { Activity, AlertCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import {
  formatEventType,
  getEventModule,
  getEventTone,
  getFriendlyActivityMessage,
} from "@/lib/activity-log-labels";
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

type ActivityLogRow = {
  id: string;
  actor_id: string | null;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  profiles:
  | {
    full_name: string | null;
    email: string | null;
    role: string | null;
  }
  | {
    full_name: string | null;
    email: string | null;
    role: string | null;
  }[]
  | null;
};

function getActor(profile: ActivityLogRow["profiles"]) {
  const actor = Array.isArray(profile) ? profile[0] : profile;

  if (!actor) {
    return {
      name: "System",
      email: "system",
      role: "system",
    };
  }

  return {
    name: actor.full_name || actor.email || "Unknown user",
    email: actor.email || "",
    role: actor.role || "user",
  };
}

function EventIcon({ tone }: { tone: string }) {
  if (tone === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (tone === "destructive") return <ShieldAlert className="h-4 w-4 text-red-600" />;
  if (tone === "warning") return <AlertCircle className="h-4 w-4 text-amber-600" />;
  return <Activity className="h-4 w-4 text-blue-600" />;
}

export default async function ActivityLogsPage() {
  await requirePermission("activityLogs.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      actor_id,
      event_type,
      target_type,
      target_id,
      details,
      created_at,
      profiles:actor_id (
        full_name,
        email,
        role
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = (data ?? []) as ActivityLogRow[];

  const todayCount = logs.filter((log) => {
    const created = new Date(log.created_at);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  const memberEvents = logs.filter((log) => log.event_type.startsWith("member.")).length;
  const permissionEvents = logs.filter((log) =>
    log.event_type.includes("permission")
  ).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">
          Important team, permission, settings and system actions.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Latest Logs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{logs.length}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {todayCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Permission Events</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">
            {permissionEvents}
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {logs.map((log) => {
              const actor = getActor(log.profiles);
              const tone = getEventTone(log.event_type);

              return (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EventIcon tone={tone} />
                      <div>
                        <div className="font-medium">
                          {getFriendlyActivityMessage(log.event_type, log.details)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatEventType(log.event_type)} · {log.event_type}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{actor.name}</div>
                    <div className="text-xs text-muted-foreground">{actor.email}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {getEventModule(log.event_type)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{log.target_type || "N/A"}</div>
                    <div className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {log.target_id || ""}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {logs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No activity logs found yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}