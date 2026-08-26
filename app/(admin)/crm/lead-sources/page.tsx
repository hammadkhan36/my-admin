"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadSourcesPage() {
  const supabase = createClient();
  const [loading, setLoading] = React.useState(true);
  const [sourceStats, setSourceStats] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data: leads, error } = await supabase.from("leads").select("source, status");
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const map: Record<string, { leads: number; converted: number }> = {};
      leads.forEach(l => {
        if (!map[l.source]) map[l.source] = { leads: 0, converted: 0 };
        map[l.source].leads++;
        if (l.status === "Won") map[l.source].converted++;
      });
      const arr = Object.entries(map).map(([source, val]) => ({
        source,
        leads: val.leads,
        conversion: val.leads > 0 ? (val.converted / val.leads) * 100 : 0,
      }));
      setSourceStats(arr);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Lead Source Analytics</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Conversion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sourceStats.map(row => (
                <TableRow key={row.source}>
                  <TableCell className="font-medium">{row.source}</TableCell>
                  <TableCell>{row.leads}</TableCell>
                  <TableCell>{row.conversion.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}