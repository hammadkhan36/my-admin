"use client";

import { useState } from "react";
import { mediaItems } from "@/lib/website-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Grid, List, Copy, Trash, CheckCircle } from "lucide-react";

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filtered = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Products", "Services", "Gallery", "Testimonials", "Website", "Other"];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <Button><Upload className="mr-2 h-4 w-4" /> Upload Media</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select className="border rounded-md px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div className="flex gap-1">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}><Grid className="h-4 w-4" /></Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">{selectedItems.length} selected</span>
          <Button variant="outline" size="sm"><Copy className="mr-2 h-4 w-4" /> Copy URL</Button>
          <Button variant="outline" size="sm"><Trash className="mr-2 h-4 w-4" /> Delete</Button>
          <Button variant="outline" size="sm"><CheckCircle className="mr-2 h-4 w-4" /> Select</Button>
        </div>
      )}

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="rounded-xl overflow-hidden">
              <div className="relative aspect-square">
                <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    if (selectedItems.includes(item.id)) setSelectedItems(selectedItems.filter(id => id !== item.id));
                    else setSelectedItems([...selectedItems, item.id]);
                  }}
                  className={`absolute top-2 left-2 h-6 w-6 rounded-full border-2 ${
                    selectedItems.includes(item.id) ? "bg-primary border-primary" : "bg-white/70 border-gray-300"
                  }`}
                />
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.size} • {item.uploadedAt}</p>
                <Badge className="mt-1">{item.category}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Size</th>
                <th className="p-3 text-left">Uploaded</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3"><Badge variant="outline">{item.category}</Badge></td>
                  <td className="p-3 text-muted-foreground">{item.size}</td>
                  <td className="p-3 text-muted-foreground">{item.uploadedAt}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon-sm"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm"><Trash className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}