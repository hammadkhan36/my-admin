



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
 target_profile: {
  full_name: string | null;
  email: string | null;
  role: string | null;
} | null;
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


function getTarget(log: ActivityLogRow) {
  const targetProfile = log.target_profile;

  if (targetProfile) {
    return {
      title: targetProfile.full_name || targetProfile.email || "Unknown member",
      subtitle: targetProfile.email || targetProfile.role || "",
    };
  }

  return {
    title: log.target_type || "System",
    subtitle: log.target_id || "",
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

  const { data, error } = await supabase
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

  if (error) {
    console.error("Activity logs query failed:", error.message);
  }

  const rawLogs = (data ?? []) as Omit<ActivityLogRow, "target_profile">[];

  const targetProfileIds = rawLogs
    .filter((log) => log.target_type === "profile" && log.target_id)
    .map((log) => log.target_id as string);

  const { data: targetProfiles } = targetProfileIds.length
    ? await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("id", targetProfileIds)
    : { data: [] };

  const targetProfileMap = new Map(
    (targetProfiles ?? []).map((profile) => [profile.id, profile])
  );

  const logs = rawLogs.map((log) => ({
    ...log,
    target_profile:
      log.target_type === "profile" && log.target_id
        ? targetProfileMap.get(log.target_id) ?? null
        : null,
  })) as ActivityLogRow[];


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
              const target = getTarget(log);

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
                    <div className="text-sm font-medium">{target.title}</div>
                    <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                      {target.subtitle}
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