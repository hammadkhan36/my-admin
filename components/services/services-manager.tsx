"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Clock, Globe2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createService,
  deleteService,
  toggleServiceStatus,
  updateService,
} from "@/app/(admin)/crm/services/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
  show_on_website: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function ServicesManager({
  services,
  title = "Services",
  description = "Manage services used by CRM, appointments and website.",
}: {
  services: ServiceRow[];
  title?: string;
  description?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = services.filter((service) => service.is_active).length;
  const websiteCount = services.filter((service) => service.show_on_website).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Services</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{services.length}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {activeCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">On Website</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {websiteCount}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Add New Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createService} className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" name="name" placeholder="Website Design" required />
            </div>

            <div className="spacespace-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" placeholder="5000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration Minutes</Label>
              <Input id="duration_minutes" name="duration_minutes" type="number" placeholder="60" />
            </div>

            <div className="flex items-end">
              <SubmitButton>Add Service</SubmitButton>
            </div>

            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Short service detail" />
            </div>

            <label className="flex items-end gap-2 text-sm">
              <input name="show_on_website" type="checkbox" defaultChecked />
              Show on website
            </label>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {services.map((service) => {
          const isEditing = editingId === service.id;

          return (
            <Card key={service.id}>
              <CardContent className="p-4">
                {isEditing ? (
                  <form action={updateService} className="grid gap-4 md:grid-cols-5">
                    <input type="hidden" name="id" value={service.id} />

                    <div className="space-y-2 md:col-span-2">
                      <Label>Name</Label>
                      <Input name="name" defaultValue={service.name} required />
                    </div>

                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={service.price ?? ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        name="duration_minutes"
                        type="number"
                        defaultValue={service.duration_minutes ?? ""}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <SubmitButton>Save</SubmitButton>
                      <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>

                    <div className="space-y-2 md:col-span-4">
                      <Label>Description</Label>
                      <Input name="description" defaultValue={service.description ?? ""} />
                    </div>

                    <label className="flex items-end gap-2 text-sm">
                      <input
                        name="show_on_website"
                        type="checkbox"
                        defaultChecked={service.show_on_website}
                      />
                      Show on website
                    </label>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{service.name}</h2>
                        <Badge variant={service.is_active ? "default" : "secondary"}>
                          {service.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {service.show_on_website && (
                          <Badge variant="outline" className="gap-1">
                            <Globe2 className="h-3 w-3" />
                            Website
                          </Badge>
                        )}
                      </div>

                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {service.price !== null && <span>Price: {service.price}</span>}
                        {service.duration_minutes !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => setEditingId(service.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <form action={toggleServiceStatus}>
                        <input type="hidden" name="id" value={service.id} />
                        <input type="hidden" name="name" value={service.name} />
                        <input type="hidden" name="is_active" value={String(service.is_active)} />
                        <SubmitButton>{service.is_active ? "Disable" : "Enable"}</SubmitButton>
                      </form>

                      <form action={deleteService}>
                        <input type="hidden" name="id" value={service.id} />
                        <input type="hidden" name="name" value={service.name} />
                        {/* <Button type="submit" variant="destructive"> */}
                          <ConfirmSubmitButton message="Delete this item?">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                          </ConfirmSubmitButton>
                        {/* </Button> */}
                      </form>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {services.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No services found yet. Add your first service above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}