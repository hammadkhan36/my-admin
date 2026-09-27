"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createCustomer,
  deleteCustomer,
} from "@/app/(admin)/crm/customers/actions";
import { ContactInput } from "@/components/contacts/contact-input";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  last_seen_at: string | null;
  created_at: string;
};

const initialState = {
  success: false,
};

export function CustomerManager({
  customers,
}: {
  customers: CustomerRow[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [state, action, pending] = useActionState(
    createCustomer,
    initialState
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
      setShowForm(false);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone ?? "",
        customer.email ?? "",
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [customers, search]);

  const customersWithEmail = customers.filter(
    (customer) => Boolean(customer.email)
  ).length;

  const recentCustomers = customers.filter((customer) => {
    const age =
      Date.now() - new Date(customer.created_at).getTime();

    return age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer profiles and contact details.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowForm((value) => !value)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Customer</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              action={action}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="customer-name">
                  Customer Name
                </Label>
                <Input
                  id="customer-name"
                  name="name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                />
                {state.errors?.name?.map((error) => (
                  <p
                    key={error}
                    className="text-xs text-destructive"
                  >
                    {error}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone</Label>
                <ContactInput
                  id="customer-phone"
                  name="phone"
                  kind="phone"
                  autoComplete="tel"
                  placeholder="+923001234567"
                />
                {state.errors?.phone?.map((error) => (
                  <p
                    key={error}
                    className="text-xs text-destructive"
                  >
                    {error}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <ContactInput
                  id="customer-email"
                  name="email"
                  kind="email"
                  autoComplete="email"
                />
                {state.errors?.email?.map((error) => (
                  <p
                    key={error}
                    className="text-xs text-destructive"
                  >
                    {error}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-address">
                  Address
                </Label>
                <Input
                  id="customer-address"
                  name="address"
                  autoComplete="street-address"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-tags">Tags</Label>
                <Input
                  id="customer-tags"
                  name="tags"
                  placeholder="VIP, repeat"
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-notes">Notes</Label>
                <Input id="customer-notes" name="notes" />
              </div>

              {state.message && !state.success && (
                <p
                  role="alert"
                  className="text-sm text-destructive md:col-span-2"
                >
                  {state.message}
                </p>
              )}

              <div className="flex gap-2 md:col-span-2">
                <PendingSubmitButton
                  disabled={pending}
                  pendingText="Creating..."
                >
                  Create Customer
                </PendingSubmitButton>

                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
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
            <CardTitle className="text-sm">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {customers.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              New This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {recentCustomers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              With Email
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {customersWithEmail}
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          aria-label="Search customers"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone or email..."
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link
                    href={`/crm/customers/${customer.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {customer.name}
                  </Link>
                  <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                    {customer.address ||
                      customer.notes ||
                      "No extra details"}
                  </div>
                </TableCell>

                <TableCell>
                  {customer.phone || "Not provided"}
                </TableCell>

                <TableCell>
                  {customer.email || "Not provided"}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(customer.tags ?? []).length > 0 ? (
                      customer.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No tags
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {new Date(
                    customer.created_at
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <form
                    action={deleteCustomer.bind(
                      null,
                      customer.id
                    )}
                    onSubmit={(event) => {
                      if (
                        !window.confirm(
                          `Delete customer "${customer.name}"?`
                        )
                      ) {
                        event.preventDefault();
                      }
                    }}
                  >
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

            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
                          }
