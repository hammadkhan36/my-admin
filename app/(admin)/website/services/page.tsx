"use client";

import { useState } from "react";
import { services } from "@/lib/website-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Star, Filter } from "lucide-react";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || s.category === category;
    return matchesSearch && matchesCategory;
  });

  const total = services.length;
  const published = services.filter((s) => s.status === "Published").length;
  const draft = services.filter((s) => s.status === "Draft").length;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Services</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Published</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{published}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Draft</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{draft}</p></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select className="border rounded-md px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Design">Design</option>
          <option value="SEO">SEO</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <Card key={service.id} className="rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
                <Badge variant="outline">{service.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{service.price}</p>
              <p className="text-sm text-muted-foreground">Category: {service.category}</p>
              <p className="text-sm text-muted-foreground">Leads: {service.leads}</p>
              {service.featured && (
                <Badge className="mt-2"><Star className="mr-1 h-3 w-3" /> Featured</Badge>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}