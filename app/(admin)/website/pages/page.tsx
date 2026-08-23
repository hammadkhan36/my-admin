"use client";

import { webPages } from "@/lib/website-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Plus } from "lucide-react";

export default function PagesPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Page</Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>SEO Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{page.status}</Badge>
                </TableCell>
                <TableCell>{page.lastUpdated}</TableCell>
                <TableCell>
                  <Badge variant={page.seoStatus === "Good" ? "secondary" : page.seoStatus === "Warning" ? "outline" : "destructive"}>
                    {page.seoStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Page Editor placeholder */}
      <Card className="mt-6">
        <CardContent className="py-4 text-center text-muted-foreground">
          Select a page to edit its content, sections, SEO, and publish status.
        </CardContent>
      </Card>
    </div>
  );
}