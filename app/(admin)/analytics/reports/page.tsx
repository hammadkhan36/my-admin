"use client";

import { useState } from "react";
import { reports } from "@/lib/analytics-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Mail } from "lucide-react";

export default function ReportsPage() {
  const [dateFilter, setDateFilter] = useState("all");

  const filtered = dateFilter === "all" ? reports : reports.filter((r) => r.type === dateFilter);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl border bg-card mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>New Customers</TableHead>
              <TableHead>WhatsApp Clicks</TableHead>
              <TableHead>Call Clicks</TableHead>
              <TableHead>Google Reviews</TableHead>
              <TableHead>Conversion Rate</TableHead>
              <TableHead>Top Service</TableHead>
              <TableHead>Top Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((report) => (
              <TableRow key={report.id}>
                <TableCell><Badge variant="outline">{report.type}</Badge></TableCell>
                <TableCell>{report.period}</TableCell>
                <TableCell>{report.leads}</TableCell>
                <TableCell>{report.newCustomers}</TableCell>
                <TableCell>{report.whatsappClicks}</TableCell>
                <TableCell>{report.callClicks}</TableCell>
                <TableCell>{report.googleReviews}</TableCell>
                <TableCell>{report.conversionRate}%</TableCell>
                <TableCell>{report.topService}</TableCell>
                <TableCell>{report.topSource}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm"><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm"><Mail className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Report Summary Preview */}
      {filtered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Summary Preview</CardTitle>
            <CardDescription>Selected report: {filtered[0].period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Leads</p>
                <p className="text-xl font-bold">{filtered[0].leads}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Customers</p>
                <p className="text-xl font-bold">{filtered[0].newCustomers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">{filtered[0].conversionRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Service</p>
                <p className="text-xl font-bold">{filtered[0].topService}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}