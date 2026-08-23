"use client";

import { useState } from "react";
import { products } from "@/lib/website-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Star } from "lucide-react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const total = products.length;
  const published = products.filter((p) => p.status === "Published").length;
  const featured = products.filter((p) => p.featured).length;
  const available = products.filter((p) => p.available).length;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Published</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{published}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Featured</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{featured}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Available</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{available}</p></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select className="border rounded-md px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="SEO">SEO</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className="rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <Badge variant="outline">{product.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{product.price}</p>
              <div className="flex gap-2 mt-2">
                {product.featured && <Badge><Star className="mr-1 h-3 w-3" /> Featured</Badge>}
                {product.available ? <Badge variant="secondary">Available</Badge> : <Badge variant="destructive">Unavailable</Badge>}
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Delete</Button>
              {product.status === "Published" ? (
                <Button variant="outline" size="sm">Unpublish</Button>
              ) : (
                <Button variant="outline" size="sm">Publish</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}