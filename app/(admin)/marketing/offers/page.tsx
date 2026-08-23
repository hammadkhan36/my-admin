"use client";

import { useState } from "react";
import { offers } from "@/lib/marketing-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Tag } from "lucide-react";

export default function OffersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = offers.filter((offer) => {
    const matchesSearch = offer.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: offers.filter((o) => o.status === "Active").length,
    draft: offers.filter((o) => o.status === "Draft").length,
    expired: offers.filter((o) => o.status === "Expired").length,
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Offers</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Offer
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-emerald-50 dark:bg-emerald-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active Offers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.active}</p></CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Draft Offers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.draft}</p></CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Expired Offers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.expired}</p></CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>All</Button>
          <Button variant={statusFilter === "Active" ? "default" : "outline"} onClick={() => setStatusFilter("Active")}>Active</Button>
          <Button variant={statusFilter === "Draft" ? "default" : "outline"} onClick={() => setStatusFilter("Draft")}>Draft</Button>
          <Button variant={statusFilter === "Expired" ? "default" : "outline"} onClick={() => setStatusFilter("Expired")}>Expired</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((offer) => (
          <Card key={offer.id} className="rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{offer.title}</CardTitle>
                  <CardDescription>{offer.description}</CardDescription>
                </div>
                <Badge variant="outline">{offer.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-primary">{offer.discount}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Start: {offer.startDate}</p>
                <p>End: {offer.endDate}</p>
                <p>Target: {offer.targetPage}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Duplicate</Button>
              <Button variant="outline" size="sm">Deactivate</Button>
              <Button variant="outline" size="sm" className="text-red-500">Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}