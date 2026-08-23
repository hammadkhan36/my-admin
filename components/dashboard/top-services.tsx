"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  { name: "Web Design", count: 245, revenue: "$18,500" },
  { name: "SEO Optimization", count: 187, revenue: "$14,200" },
  { name: "Social Media", count: 156, revenue: "$9,800" },
  { name: "Branding", count: 98, revenue: "$7,300" },
  { name: "Consulting", count: 62, revenue: "$5,100" },
];

export function TopServices() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Top Services</CardTitle>
        <CardDescription>Most sold services this period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.count} orders</p>
                </div>
              </div>
              <span className="text-sm font-semibold">{service.revenue}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
