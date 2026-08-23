"use client";

import { useState } from "react";
import { websiteAnalytics, leadAnalytics, marketingAnalytics, trafficSources, topPages, landingPages } from "@/lib/analytics-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, Activity, Eye, MousePointer, TrendingUp, Share2 } from "lucide-react";

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState("30d");

  const ranges = ["7d", "30d", "90d", "custom"];

  // Prepare data for traffic sources bar chart
  const trafficChartData = trafficSources.map((t) => ({
    source: t.source,
    visitors: t.visitors,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {ranges.map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === "custom" ? "Custom" : range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Website Analytics Stats */}
      <h2 className="text-lg font-semibold mb-4">Website Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{websiteAnalytics.visitors.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{websiteAnalytics.sessions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{websiteAnalytics.pageViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{websiteAnalytics.avgSessionDuration}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Analytics */}
      <h2 className="text-lg font-semibold mb-4">Lead Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Leads</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{leadAnalytics.leads}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Conversion Rate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{leadAnalytics.conversionRate}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Quote Requests</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{leadAnalytics.quoteRequests}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">WhatsApp Clicks</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{leadAnalytics.whatsappClicks}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Call Clicks</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{leadAnalytics.callClicks}</p></CardContent>
        </Card>
      </div>

      {/* Marketing Analytics */}
      <h2 className="text-lg font-semibold mb-4">Marketing Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Campaigns</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{marketingAnalytics.campaigns}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Coupons</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{marketingAnalytics.coupons}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Referrals</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{marketingAnalytics.referrals}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Traffic Sources</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{marketingAnalytics.trafficSources}</p></CardContent>
        </Card>
      </div>

      {/* Top Pages & Landing Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topPages.map((page) => (
                <li key={page.page} className="flex justify-between text-sm">
                  <span>{page.page}</span>
                  <span className="font-medium">{page.views.toLocaleString()} views</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Landing Pages</CardTitle>
            <CardDescription>Pages that generate leads</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {landingPages.map((page) => (
                <li key={page.page} className="flex justify-between text-sm">
                  <span>{page.page}</span>
                  <span className="font-medium">{page.leads} leads ({page.conversionRate}%)</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources Bar Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Traffic Sources Overview</CardTitle>
          <CardDescription>Visitors by source (selected range)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}