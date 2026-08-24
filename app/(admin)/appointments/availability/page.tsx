"use client";

import { useState } from "react";
import { availabilitySettings } from "@/lib/appointment-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save } from "lucide-react";

export default function AvailabilityPage() {
  const [settings, setSettings] = useState(availabilitySettings);

  const toggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const updateStaffAvailability = (staffName: string, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      staffAvailability: prev.staffAvailability.map((sa) =>
        sa.staff === staffName ? { ...sa, [field]: value } : sa
      ),
    }));
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Availability</h1>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      {/* Business Hours */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Business Appointment Hours</CardTitle>
          <CardDescription>Set overall working days and hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <Button
                key={day}
                variant={settings.workingDays.includes(day) ? "default" : "outline"}
                onClick={() => toggleDay(day)}
                className="h-8 px-3 text-xs"
              >
                {day}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Opening Time</Label>
              <Input
                type="time"
                value={settings.openingTime}
                onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
              />
            </div>
            <div>
              <Label>Closing Time</Label>
              <Input
                type="time"
                value={settings.closingTime}
                onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Break Times</Label>
            {settings.breakTimes.map((breakTime, idx) => (
              <div key={idx} className="flex gap-2 mt-1">
                <Input type="time" value={breakTime.start} readOnly />
                <span>to</span>
                <Input type="time" value={breakTime.end} readOnly />
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="mr-1 h-4 w-4" /> Add Break
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Availability */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff Availability</CardTitle>
          <CardDescription>Set individual staff working hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.staffAvailability.map((sa) => (
            <div key={sa.staff} className="border-b pb-2">
              <div className="flex flex-wrap items-center justify-between">
                <span className="font-medium">{sa.staff}</span>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={sa.start}
                    onChange={(e) => updateStaffAvailability(sa.staff, "start", e.target.value)}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={sa.end}
                    onChange={(e) => updateStaffAvailability(sa.staff, "end", e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <Button
                    key={day}
                    variant={sa.days.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        staffAvailability: prev.staffAvailability.map((s) =>
                          s.staff === sa.staff
                            ? {
                                ...s,
                                days: s.days.includes(day)
                                  ? s.days.filter((d) => d !== day)
                                  : [...s.days, day],
                              }
                            : s
                        ),
                      }))
                    }
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Holidays & Blocked Dates */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Holidays & Blocked Dates</CardTitle>
          <CardDescription>Dates when appointments are not available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Holidays</Label>
            <Input
              value={settings.holidays.join(", ")}
              onChange={(e) => setSettings({ ...settings, holidays: e.target.value.split(", ") })}
            />
          </div>
          <div>
            <Label>Blocked Dates</Label>
            <Input
              value={settings.blockedDates.join(", ")}
              onChange={(e) => setSettings({ ...settings, blockedDates: e.target.value.split(", ") })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Slot Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Slot Settings</CardTitle>
          <CardDescription>Duration and buffer for appointments</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Slot Duration (minutes)</Label>
            <Input
              type="number"
              value={settings.slotDuration}
              onChange={(e) => setSettings({ ...settings, slotDuration: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Buffer Time (minutes)</Label>
            <Input
              type="number"
              value={settings.bufferTime}
              onChange={(e) => setSettings({ ...settings, bufferTime: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}