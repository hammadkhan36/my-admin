"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export function CustomerTimeline({ customerId }: { customerId: string }) {
  const supabase = createClient();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (data) setActivities(data);
    };
    fetchActivities();
  }, [customerId]);

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
          <div>
            <p className="text-sm font-medium">{act.description}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(act.created_at).toLocaleString()} • {act.actor_type}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}