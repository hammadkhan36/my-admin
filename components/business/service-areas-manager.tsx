"use client";

import { useActionState, useEffect } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createServiceArea,
  deleteServiceArea,
  toggleServiceArea,
} from "@/app/(admin)/business/service-areas/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ServiceAreaRow = {
  id: string;
  area_name: string;
  city: string | null;
  is_active: boolean;
  sort_order: number;
};

const initialState = {
  success: false,
};

export function ServiceAreasManager({ areas }: { areas: ServiceAreaRow[] }) {
  const [state, action] = useActionState(createServiceArea, initialState);

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const activeAreas = areas.filter((area) => area.is_active).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Service Areas</h1>
        <p className="text-sm text-muted-foreground">
          Manage the areas this business serves.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Areas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{areas.length}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {activeAreas}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inactive</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            {areas.length - activeAreas}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Service Area</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="area_name">Area Name</Label>
              <Input id="area_name" name="area_name" placeholder="Peoples Colony" />
              {state.errors?.area_name?.map((error) => (
                <p key={error} className="text-xs text-destructive">
                  {error}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Attock" />
            </div>

            <PendingSubmitButton pendingText="Adding...">
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </PendingSubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {areas.map((area) => (
          <Card key={area.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{area.area_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {area.city || "No city"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={area.is_active ? "secondary" : "outline"}>
                  {area.is_active ? "Active" : "Inactive"}
                </Badge>

                <form action={toggleServiceArea.bind(null, area.id, !area.is_active)}>
                  <PendingSubmitButton size="sm" variant="outline" pendingText="Saving...">
                    {area.is_active ? "Disable" : "Enable"}
                  </PendingSubmitButton>
                </form>

                <form action={deleteServiceArea.bind(null, area.id)}>
                  <PendingSubmitButton size="sm" variant="destructive" pendingText="Deleting...">
                    <Trash2 className="h-4 w-4" />
                  </PendingSubmitButton>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}

        {areas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No service areas found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}