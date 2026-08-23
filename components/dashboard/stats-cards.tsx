"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  UserPlus,
  MessageCircle,
  Phone,
  Percent,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const stats = [
  {
    title: "Total Leads",
    value: "2,847",
    change: "+12.4%",
    trend: "up",
    icon: Users,
  },
  {
    title: "New Customers",
    value: "432",
    change: "+8.2%",
    trend: "up",
    icon: UserPlus,
  },
  {
    title: "WhatsApp Clicks",
    value: "1,102",
    change: "+18.7%",
    trend: "up",
    icon: MessageCircle,
  },
  {
    title: "Call Clicks",
    value: "689",
    change: "-3.1%",
    trend: "down",
    icon: Phone,
  },
  {
    title: "Conversion Rate",
    value: "15.2%",
    change: "+2.4%",
    trend: "up",
    icon: Percent,
  },
  {
    title: "Google Reviews",
    value: "4.8",
    change: "+0.2",
    trend: "up",
    icon: Star,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-medium">
              {stat.title}
            </CardDescription>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs flex items-center gap-1 ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
              {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}