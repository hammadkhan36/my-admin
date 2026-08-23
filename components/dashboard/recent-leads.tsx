"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type LeadStatus = "New" | "Contacted" | "Qualified" | "Closed";

const leads: { name: string; email: string; service: string; status: LeadStatus; date: string }[] = [
  { name: "Ali Raza", email: "ali@example.com", service: "Web Design", status: "New", date: "2h ago" },
  { name: "Sana Khan", email: "sana@example.com", service: "SEO", status: "Contacted", date: "5h ago" },
  { name: "Usman Tariq", email: "usman@example.com", service: "Social Media", status: "Qualified", date: "1d ago" },
  { name: "Ayesha Malik", email: "ayesha@example.com", service: "Branding", status: "New", date: "2d ago" },
  { name: "Bilal Ahmed", email: "bilal@example.com", service: "Consulting", status: "Closed", date: "3d ago" },
];

const statusColors: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Qualified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function RecentLeads() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
        <CardDescription>Latest 5 leads across all sources</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.email}>
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                </TableCell>
                <TableCell>{lead.service}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{lead.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
