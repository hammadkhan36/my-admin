"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    createLead,
    deleteLead,
    updateLeadStatus,
} from "@/app/(admin)/crm/leads/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type LeadRow = {
    id: string;
    customer_id: string | null;
    name: string;
    phone: string;
    email: string | null;
    service: string | null;
    message: string | null;
    source: string;
    status: string;
    priority: string;
    created_at: string;
    page_url: string | null;
    referrer: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
};

const initialState = { success: false };

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    new: "default",
    contacted: "secondary",
    qualified: "secondary",
    won: "secondary",
    lost: "destructive",
};

export function LeadsManager({ leads }: { leads: LeadRow[] }) {
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [state, action, pending] = useActionState(createLead, initialState);

    useEffect(() => {
        if (!state.message) return;

        if (state.success) {
            toast.success(state.message);
            setShowForm(false);
        } else {
            toast.error(state.message);
        }
    }, [state]);

    const filteredLeads = useMemo(() => {
        const query = search.toLowerCase().trim();

        return leads.filter((lead) => {
            const matchesSearch =
                !query ||
                lead.name.toLowerCase().includes(query) ||
                lead.phone.toLowerCase().includes(query) ||
                lead.email?.toLowerCase().includes(query) ||
                lead.service?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" || lead.status === statusFilter;

            const matchesSource =
                sourceFilter === "all" || lead.source === sourceFilter;

            return matchesSearch && matchesStatus && matchesSource;
        });
    }, [leads, search, statusFilter, sourceFilter]);

    const newLeads = leads.filter((lead) => lead.status === "new").length;
    const wonLeads = leads.filter((lead) => lead.status === "won").length;

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-sm text-muted-foreground">
                        Capture and manage website or manual business leads.
                    </p>
                </div>

                <Button onClick={() => setShowForm((value) => !value)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lead
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Create Lead</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={action} className="grid gap-4 md:grid-cols-2">
                            <input type="hidden" name="source" value="manual" />

                            <div className="space-y-2">
                                <Label htmlFor="name">Customer Name</Label>
                                <Input id="name" name="name" required />
                                {state.errors?.name?.map((error) => (
                                    <p key={error} className="text-xs text-destructive">
                                        {error}
                                    </p>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" required />
                                {state.errors?.phone?.map((error) => (
                                    <p key={error} className="text-xs text-destructive">
                                        {error}
                                    </p>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="service">Service/Product Interest</Label>
                                <Input id="service" name="service" placeholder="Birthday cake, repair, quote..." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select id="status" name="status" defaultValue="new" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="won">Won</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select id="priority" name="priority" defaultValue="normal" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="message">Message</Label>
                                <Input id="message" name="message" />
                            </div>

                            <div className="flex gap-2 md:col-span-2">
                                <PendingSubmitButton disabled={pending} pendingText="Creating...">
                                    Create Lead
                                </PendingSubmitButton>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Leads</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">{leads.length}</CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">New Leads</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-blue-600">
                        {newLeads}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Won Leads</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-emerald-600">
                        {wonLeads}
                    </CardContent>
                </Card>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, phone, email or service..."
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                </select>

                <select
                    value={sourceFilter}
                    onChange={(event) => setSourceFilter(event.target.value)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">All Sources</option>
                    <option value="manual">Manual</option>
                    <option value="website">Website</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Tracking</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredLeads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <Link
                                        href={`/crm/leads/${lead.id}`}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {lead.name}
                                    </Link>
                                    <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                                        {lead.email || lead.message || "No extra details"}
                                    </div>
                                </TableCell>

                                <TableCell>{lead.phone}</TableCell>
                                <TableCell>{lead.service || "N/A"}</TableCell>

                                <TableCell>
                                    <form action={updateLeadStatus} className="flex items-center gap-2">
                                        <input type="hidden" name="leadId" value={lead.id} />
                                        <select
                                            name="status"
                                            defaultValue={lead.status}
                                            className="h-8 rounded-md border bg-background px-2 text-xs capitalize"
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="won">Won</option>
                                            <option value="lost">Lost</option>
                                        </select>

                                        <PendingSubmitButton size="sm" variant="outline" pendingText="Saving...">
                                            Save
                                        </PendingSubmitButton>
                                    </form>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {lead.source}
                                    </Badge>
                                </TableCell>


                                <TableCell>
  <div className="space-y-1 text-xs">
    {lead.utm_source && (
      <Badge variant="outline">UTM: {lead.utm_source}</Badge>
    )}

    {lead.page_url ? (
      <a
        href={lead.page_url}
        target="_blank"
        rel="noreferrer"
        className="flex max-w-[180px] items-center gap-1 truncate text-primary hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        Page
      </a>
    ) : (
      <span className="text-muted-foreground">No tracking</span>
    )}
  </div>
</TableCell>

                                <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>

                                <TableCell className="text-right">
                                    <form action={deleteLead.bind(null, lead.id)}>
                                        <PendingSubmitButton
                                            size="sm"
                                            variant="destructive"
                                            pendingText="Deleting..."
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            Delete
                                        </PendingSubmitButton>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}

                        {filteredLeads.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}