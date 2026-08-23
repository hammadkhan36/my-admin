"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  { label: "Visitors", value: "12,840", percentage: 100 },
  { label: "Leads", value: "2,847", percentage: 22 },
  { label: "Qualified Leads", value: "1,420", percentage: 50 },
  { label: "Customers", value: "432", percentage: 30 },
];

export function ConversionFunnel() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Visitor to customer journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.label}>
            <div className="flex justify-between text-sm mb-1">
              <span>{step.label}</span>
              <span className="font-medium">{step.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${step.percentage}%`,
                  background: `hsl(${200 + index * 20}, 70%, 45%)`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}