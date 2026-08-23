"use client";

import { trafficSources } from "@/lib/analytics-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function TrafficSourcesPage() {
  // Data for comparison chart: Visitors vs Conversion Rate
  const chartData = trafficSources.map((t) => ({
    source: t.source,
    visitors: t.visitors,
    conversionRate: t.conversionRate,
  }));

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Traffic Sources</h1>

      {/* Comparison Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Visitors vs Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="visitors" name="Visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="conversionRate" name="Conversion Rate (%)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Visitors</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>Conversion Rate</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trafficSources.map((source) => (
              <TableRow key={source.source}>
                <TableCell className="font-medium">{source.source}</TableCell>
                <TableCell>{source.visitors.toLocaleString()}</TableCell>
                <TableCell>{source.leads}</TableCell>
                <TableCell>{source.customers}</TableCell>
                <TableCell>{source.conversionRate}%</TableCell>
                <TableCell>${source.revenue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}