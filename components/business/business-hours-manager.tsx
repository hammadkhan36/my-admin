"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { updateBusinessHours } from "@/app/(admin)/business/hours/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type BusinessHourRow = {
  id: string;
  day_of_week: number;
  day_name: string;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  is_24h: boolean;
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save Hours
        </>
      )}
    </Button>
  );
}

export function BusinessHoursManager({ hours }: { hours: BusinessHourRow[] }) {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Business Hours</h1>
        <p className="text-sm text-muted-foreground">
          Set weekly opening hours for the business website and dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateBusinessHours} className="space-y-4">
            {hours.map((hour) => (
              <div
                key={hour.id}
                className="grid gap-3 rounded-md border p-3 md:grid-cols-[140px_1fr_1fr_auto_auto]"
              >
                <input type="hidden" name="id" value={hour.id} />

                <div className="font-medium">{hour.day_name}</div>

                <div className="space-y-1">
                  <Label htmlFor={`opens-${hour.id}`}>Open</Label>
                  <Input
                    id={`opens-${hour.id}`}
                    name="opens_at"
                    type="time"
                    defaultValue={hour.opens_at ?? ""}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`closes-${hour.id}`}>Close</Label>
                  <Input
                    id={`closes-${hour.id}`}
                    name="closes_at"
                    type="time"
                    defaultValue={hour.closes_at ?? ""}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    name={`is_closed_${hour.id}`}
                    defaultChecked={hour.is_closed}
                  />
                  Closed
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    name={`is_24h_${hour.id}`}
                    defaultChecked={hour.is_24h}
                  />
                  24h
                </label>
              </div>
            ))}

            <SaveButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}