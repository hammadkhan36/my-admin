"use client";

import { useState } from "react";
import { businessHours, specialHours, SpecialHours } from "@/lib/business-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Clock } from "lucide-react";

export default function BusinessHoursPage() {
  const [hours, setHours] = useState(businessHours);
  const [special, setSpecial] = useState<SpecialHours[]>(specialHours);

  const toggleDay = (day: string) => {
    setHours(
      hours.map((h) => (h.day === day ? { ...h, open: !h.open } : h))
    );
  };

  const updateTime = (day: string, field: "openingTime" | "closingTime", value: string) => {
    setHours(
      hours.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    );
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Business Hours</h1>

      {/* Weekly Schedule */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Set opening and closing times for each day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hours.map((day) => (
            <div key={day.day} className="flex items-center justify-between gap-4 border-b pb-2">
              <div className="flex items-center gap-3">
                <Toggle
                  pressed={day.open}
                  onPressedChange={() => toggleDay(day.day)}
                  className={day.open ? "bg-emerald-100 text-emerald-700" : ""}
                >
                  {day.open ? "Open" : "Closed"}
                </Toggle>
                <span className="font-medium w-24">{day.day}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={day.openingTime}
                  disabled={!day.open}
                  onChange={(e) => updateTime(day.day, "openingTime", e.target.value)}
                  className="w-32"
                />
                <span>to</span>
                <Input
                  type="time"
                  value={day.closingTime}
                  disabled={!day.open}
                  onChange={(e) => updateTime(day.day, "closingTime", e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Special / Holiday Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Special Hours / Holidays</CardTitle>
          <CardDescription>Dates when normal hours don't apply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {special.map((s, index) => (
              <div key={index} className="flex items-center gap-4 border-b pb-2">
                <div className="w-28">
                  <Label>Date</Label>
                  <Input type="date" value={s.date} readOnly />
                </div>
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input value={s.description} readOnly />
                </div>
                <div className="w-40">
                  <Label>Hours</Label>
                  <Input
                    value={s.open ? `${s.openingTime} - ${s.closingTime}` : "Closed"}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4" variant="outline">
            <Clock className="mr-2 h-4 w-4" /> Add Special Hours
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}