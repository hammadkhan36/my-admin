"use client";

import { useState } from "react";
import { leads, Lead } from "@/lib/crm-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);



  
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const statusColors: Record<string, string> = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Qualified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    Won: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    Lost: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage and track your leads</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Google Ads">Google Ads</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">
            {selectedLeads.length} selected
          </span>
          <Button variant="outline" size="sm">Mark Contacted</Button>
          <Button variant="outline" size="sm">Bulk Status Change</Button>
          <Button variant="outline" size="sm">Delete</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedLeads(filteredLeads.map((l) => l.id));
                    else setSelectedLeads([]);
                  }}
                />
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedLeads([...selectedLeads, lead.id]);
                      else setSelectedLeads(selectedLeads.filter((id) => id !== lead.id));
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{lead.customer}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs">{lead.email}</span>
                    <span className="text-xs text-muted-foreground">{lead.phone}</span>
                  </div>
                </TableCell>
                <TableCell>{lead.service}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                </TableCell>
                <TableCell>{lead.assignedStaff}</TableCell>
                <TableCell>{lead.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm"><Mail className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm"><MessageCircle className="h-4 w-4" /></Button>
                    <Link href={`/crm/leads/${lead.id}`}>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button variant="outline" size="sm">Previous</Button>
        <span className="text-sm">Page 1 of 10</span>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
}