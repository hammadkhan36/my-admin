"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", leads: 220 },
  { month: "Feb", leads: 280 },
  { month: "Mar", leads: 250 },
  { month: "Apr", leads: 320 },
  { month: "May", leads: 310 },
  { month: "Jun", leads: 380 },
  { month: "Jul", leads: 360 },
  { month: "Aug", leads: 420 },
  { month: "Sep", leads: 400 },
  { month: "Oct", leads: 460 },
  { month: "Nov", leads: 440 },
  { month: "Dec", leads: 510 },
];

export function LeadsOverviewChart() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Leads Overview</CardTitle>
        <CardDescription>Monthly lead generation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--primary))"
                fill="url(#leadGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}