// "use client";

// import { useState } from "react";
// import { galleryItems } from "@/lib/reputation-data";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Check, X, Edit, Trash, Eye } from "lucide-react";

// export default function CustomerGalleryPage() {
//   const [activeTab, setActiveTab] = useState("all");

//   const filtered = activeTab === "all"
//     ? galleryItems
//     : galleryItems.filter((item) => item.status === activeTab);

//   const tabs = [
//     { value: "all", label: "All" },
//     { value: "Before & After", label: "Before & After" },
//     { value: "Customer Uploads", label: "Customer Uploads" },
//     { value: "Pending Review", label: "Pending Review" },
//     { value: "Published", label: "Published" },
//   ];

//   return (
//     <div className="p-4 md:p-6">
//       <h1 className="text-2xl font-bold mb-6">Customer Gallery</h1>

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="mb-6">
//           {tabs.map((tab) => (
//             <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
//           ))}
//         </TabsList>

//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {filtered.map((item) => (
//             <Card key={item.id} className="rounded-xl overflow-hidden">
//               <div className="relative aspect-square">
//                 <img
//                   src={item.image}
//                   alt={item.customer}
//                   className="h-full w-full object-cover"
//                 />
//                 <Badge className="absolute top-2 right-2">{item.status}</Badge>
//               </div>
//               <CardContent className="p-3">
//                 <p className="font-medium text-sm">{item.customer}</p>
//                 <p className="text-xs text-muted-foreground">{item.service}</p>
//                 <p className="text-xs text-muted-foreground">{item.date}</p>
//                 <div className="flex justify-end gap-1 mt-2">
//                   <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon-sm"><Check className="h-4 w-4 text-emerald-500" /></Button>
//                   <Button variant="ghost" size="icon-sm"><X className="h-4 w-4 text-red-500" /></Button>
//                   <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
//                   <Button variant="ghost" size="icon-sm"><Trash className="h-4 w-4" /></Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </Tabs>
//     </div>
//   );
// }







import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { MediaManager, type MediaRow } from "@/components/website/media-manager";

export default async function GalleryPage() {
  await requirePermission("gallery.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media_items")
    .select(
      "id, title, description, image_url, alt_text, category, is_featured, is_active, sort_order, created_at"
    )
    .eq("category", "gallery")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <MediaManager
      items={(data ?? []) as MediaRow[]}
      title="Gallery"
      description="Manage gallery images shown on the business website."
    />
  );
}