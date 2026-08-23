"use client";

import { seoData } from "@/lib/website-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gauge, FileCheck, AlertTriangle, XCircle } from "lucide-react";

export default function SEOPage() {
  const stats = [
    { label: "Overall SEO Score", value: `${seoData.overallScore}`, icon: Gauge },
    { label: "Pages Optimized", value: `${seoData.pagesOptimized}`, icon: FileCheck },
    { label: "Missing Titles", value: `${seoData.missingTitles}`, icon: XCircle },
    { label: "Missing Meta Descriptions", value: `${seoData.missingMetaDescriptions}`, icon: AlertTriangle },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">SEO Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <Card className="mb-6">
        <CardHeader><CardTitle>SEO Issues</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{seoData.seoIssues} issues found across pages.</p>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>SEO Title</TableHead>
              <TableHead>Meta Description</TableHead>
              <TableHead>Indexing</TableHead>
              <TableHead>SEO Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seoData.pages.map((page) => (
              <TableRow key={page.page}>
                <TableCell className="font-medium">{page.page}</TableCell>
                <TableCell>{page.title || <span className="text-red-500">Missing</span>}</TableCell>
                <TableCell>{page.metaDescription || <span className="text-red-500">Missing</span>}</TableCell>
                <TableCell><Badge variant="outline">{page.indexing}</Badge></TableCell>
                <TableCell>
                  <span className={`font-semibold ${page.score >= 80 ? "text-emerald-500" : page.score >= 50 ? "text-amber-500" : "text-red-500"}`}>
                    {page.score}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* SEO Editor placeholder */}
      <Card className="mt-6">
        <CardHeader><CardTitle>SEO Editor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">SEO Title</label>
              <input className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Enter SEO title" />
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <input className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Enter meta description" />
            </div>
            <div>
              <label className="text-sm font-medium">Focus Keyword</label>
              <input className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Enter focus keyword" />
            </div>
            <div>
              <label className="text-sm font-medium">Canonical URL</label>
              <input className="w-full border rounded-md px-3 py-2 mt-1" placeholder="https://example.com/page" />
            </div>
            <div>
              <label className="text-sm font-medium">Robots</label>
              <select className="w-full border rounded-md px-3 py-2 mt-1">
                <option>index, follow</option>
                <option>noindex, nofollow</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">OG Title</label>
              <input className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Open Graph title" />
            </div>
            <div>
              <label className="text-sm font-medium">OG Description</label>
              <input className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Open Graph description" />
            </div>
            <div>
              <label className="text-sm font-medium">OG Image</label>
              <input className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Image URL" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}