"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Settings, CalendarClock } from "lucide-react";

type AppointmentActivity = {
  id: string;
  actor_type: string | null;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
};

export function AppointmentTimeline({ appointmentId }: { appointmentId: string }) {
  const supabase = createClient();
  const [activities, setActivities] = React.useState<AppointmentActivity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setActivities(data as AppointmentActivity[]);
      }
      setLoading(false);
    };

    fetchActivities();
  }, [appointmentId]);

  const getActorIcon = (actorType: string | null) => {
    switch (actorType) {
      case "admin":
        return <User className="h-3.5 w-3.5" />;
      case "system":
        return <Settings className="h-3.5 w-3.5" />;
      case "customer":
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <CalendarClock className="h-3.5 w-3.5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No activity recorded for this appointment yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {getActorIcon(act.actor_type)}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{act.description}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(act.created_at).toLocaleString()} • {act.actor_type || "unknown"}
            </p>
            {act.metadata && Object.keys(act.metadata).length > 0 && (
              <div className="pt-1 text-xs text-muted-foreground">
                {Object.entries(act.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}