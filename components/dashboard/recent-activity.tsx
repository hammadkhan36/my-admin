"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const activities = [
  { icon: "🎯", text: "New lead: Ali Raza (Web Design)", time: "2h ago" },
  { icon: "📞", text: "Call click from Google Ads", time: "4h ago" },
  { icon: "⭐", text: "New 5-star review received", time: "6h ago" },
  { icon: "💬", text: "WhatsApp click from Instagram", time: "1d ago" },
  { icon: "✅", text: "Campaign 'Summer Sale' completed", time: "2d ago" },
];

export function RecentActivity() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions on your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
