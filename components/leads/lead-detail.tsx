"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { addLeadNote, updateLeadStatus } from "@/app/(admin)/crm/leads/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LeadDetailRow = {
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
  updated_at: string;
  customers:
    | {
        id: string;
        name: string;
        phone: string;
        email: string | null;
      }
    | {
        id: string;
        name: string;
        phone: string;
        email: string | null;
      }[]
    | null;
};

export type LeadNoteRow = {
  id: string;
  note: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
};

export type LeadStatusHistoryRow = {
  id: string;
  old_status: string | null;
  new_status: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
};

const initialState = { success: false };

function getSingle<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function LeadDetail({
  lead,
  notes,
  history,
}: {
  lead: LeadDetailRow;
  notes: LeadNoteRow[];
  history: LeadStatusHistoryRow[];
}) {
  const [noteState, noteAction] = useActionState(addLeadNote, initialState);
  const customer = getSingle(lead.customers);

  useEffect(() => {
    if (!noteState.message) return;

    if (noteState.success) {
      toast.success(noteState.message);
    } else {
      toast.error(noteState.message);
    }
  }, [noteState]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/crm/leads"
            className={`${buttonVariants({ variant: "ghost", size: "sm" })} mb-2`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Link>

          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-sm text-muted-foreground">
            Lead details, status, notes and customer link.
          </p>
        </div>

        <div className="flex gap-2">
          <Badge className="capitalize">{lead.status}</Badge>
          <Badge variant="outline" className="capitalize">
            {lead.priority}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div className="font-medium">{lead.phone}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium">{lead.email || "N/A"}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Service</div>
                <div className="font-medium">{lead.service || "N/A"}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Source</div>
                <div className="font-medium capitalize">{lead.source}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-muted-foreground">Message</div>
                <div className="font-medium">{lead.message || "No message"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateLeadStatus} className="flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="leadId" value={lead.id} />

                <select
                  name="status"
                  defaultValue={lead.status}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>

                <PendingSubmitButton pendingText="Updating...">
                  <Save className="mr-2 h-4 w-4" />
                  Update Status
                </PendingSubmitButton>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={noteAction} className="space-y-3">
                <input type="hidden" name="leadId" value={lead.id} />
                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Input id="note" name="note" placeholder="Follow-up details..." />
                  {noteState.errors?.note?.map((error) => (
                    <p key={error} className="text-xs text-destructive">
                      {error}
                    </p>
                  ))}
                </div>

                <PendingSubmitButton pendingText="Adding note...">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </PendingSubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linked Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-2 text-sm">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-muted-foreground">{customer.phone}</div>
                  <div className="text-muted-foreground">{customer.email || "N/A"}</div>
                  <Link
                    href={`/crm/customers/${customer.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                      Open Customer
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No customer linked.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((item) => {
                const actor = getSingle(item.profiles);
                return (
                  <div key={item.id} className="border-b pb-3 last:border-0">
                    <div className="text-sm font-medium">
                      {item.old_status || "none"} -&gt; {item.new_status}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {actor?.full_name || actor?.email || "System"} ·{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })}

              {history.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No status history found.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.map((note) => {
                const actor = getSingle(note.profiles);
                return (
                  <div key={note.id} className="border-b pb-3 last:border-0">
                    <div className="text-sm">{note.note}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {actor?.full_name || actor?.email || "System"} ·{" "}
                      {new Date(note.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })}

              {notes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No notes added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}