"use client";

import { useState } from "react";
import { appointments } from "@/lib/appointment-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";

export default function CalendarPage() {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [staffFilter, setStaffFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  const staffList = Array.from(new Set(appointments.map((a) => a.staff)));
  const serviceList = Array.from(new Set(appointments.map((a) => a.service)));

  // Simple static calendar grid placeholder
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentWeek = ["May 27", "May 28", "May 29", "May 30", "May 31", "Jun 1", "Jun 2"];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-medium">May 27 - Jun 2</span>
          <Button variant="outline"><ChevronRight className="h-4 w-4" /></Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Create Appointment</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Select
          value={staffFilter}
          onValueChange={(value) => setStaffFilter(value ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {staffList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select
          value={serviceFilter}
          onValueChange={(value) => setServiceFilter(value ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {serviceList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid Placeholder */}
      <Card>
        <CardContent className="py-8">
          {view === "week" && (
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => (
                <div key={day} className="border rounded-lg p-2 min-h-[400px]">
                  <div className="text-center">
                    <p className="font-medium">{day}</p>
                    <p className="text-xs text-muted-foreground">{currentWeek[idx]}</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {appointments
                      .filter((a) => a.date === "2024-06-01" && idx === 5) // demo: sirf ek din
                      .map((apt) => (
                        <div key={apt.id} className="bg-primary/10 text-primary rounded p-1 text-xs">
                          {apt.time} - {apt.customer}
                        </div>
                      ))}
                    {/* Placeholder for other days */}
                    {idx === 5 && (
                      <div className="bg-blue-100 dark:bg-blue-900/40 rounded p-1 text-xs">
                        10:00 - Ali Raza (Haircut)
                      </div>
                    )}
                    {idx === 5 && (
                      <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded p-1 text-xs">
                        11:30 - Sana Khan (Hair Coloring)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {view !== "week" && (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <CalendarDays className="mr-2 h-6 w-6" />
              {view} view coming soon (drag & drop rescheduling)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}