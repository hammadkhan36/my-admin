"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, UserPlus, TrendingUp, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadOverview() {
  const supabase = createClient();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ total: 0, new: 0, qualified: 0, converted: 0, lost: 0, conversionRate: 0 });
  const [sourceData, setSourceData] = React.useState([]);
  const [typeData, setTypeData] = React.useState([]);
  const [trendData, setTrendData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: leads, error } = await supabase.from("leads").select("*");
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      const total = leads.length;
      const newLeads = leads.filter(l => l.status === "New").length;
      const qualified = leads.filter(l => l.status === "Qualified").length;
      const converted = leads.filter(l => l.status === "Won").length;
      const lost = leads.filter(l => l.status === "Lost").length;
      const conversionRate = total > 0 ? (converted / total) * 100 : 0;

      setStats({ total, new: newLeads, qualified, converted, lost, conversionRate: Number(conversionRate.toFixed(1)) });

      // Source distribution
      const sourceMap: Record<string, number> = {};
      leads.forEach(l => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
      setSourceData(Object.entries(sourceMap).map(([name, value]) => ({ name, value })) as any);

      // Type distribution
      const typeMap: Record<string, number> = {};
      leads.forEach(l => { typeMap[l.lead_type] = (typeMap[l.lead_type] || 0) + 1; });
      setTypeData(Object.entries(typeMap).map(([name, value]) => ({ name, value })) as any);

      // Trend (last 30 days simplified: by day)
      const now = new Date();
      const last30 = new Date(now);
      last30.setDate(now.getDate() - 30);
      const trendMap: Record<string, number> = {};
      leads.forEach(l => {
        const d = new Date(l.created_at);
        if (d >= last30) {
          const day = d.toISOString().split("T")[0];
          trendMap[day] = (trendMap[day] || 0) + 1;
        }
      });
      const trend = Object.entries(trendMap).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
      setTrendData(trend as any);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Leads</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">New Leads</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{stats.new}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Qualified</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600">{stats.qualified}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Converted</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{stats.converted}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Lost</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{stats.lost}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion Rate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.conversionRate}%</p></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Lead Trend (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lead Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lead Types</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}