"use client";

import { referrals } from "@/lib/marketing-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MousePointer, Users, UserPlus, Percent, Gift } from "lucide-react";

export default function ReferralsPage() {
  const stats = [
    { label: "Referral Clicks", value: "2,450", icon: MousePointer },
    { label: "Leads", value: "856", icon: Users },
    { label: "Customers", value: "234", icon: UserPlus },
    { label: "Conversion Rate", value: "27.3%", icon: Percent },
    { label: "Rewards", value: "$4,120", icon: Gift },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Referrals</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Rewards</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((ref) => (
              <TableRow key={ref.id}>
                <TableCell className="font-medium">{ref.customer}</TableCell>
                <TableCell>{ref.referralCode}</TableCell>
                <TableCell>{ref.clicks}</TableCell>
                <TableCell>{ref.leads}</TableCell>
                <TableCell>{ref.conversions}</TableCell>
                <TableCell>${ref.rewards}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ref.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

