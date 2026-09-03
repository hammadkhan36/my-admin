// "use client";

// import { useState } from "react";
// import { faqs } from "@/lib/website-data";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Plus, Search, Edit, Trash, ArrowUp, ArrowDown } from "lucide-react";

// export default function FAQsPage() {
//   const [search, setSearch] = useState("");
//   const [pageFilter, setPageFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const filtered = faqs.filter((faq) => {
//     const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) ||
//       faq.answer.toLowerCase().includes(search.toLowerCase());
//     const matchesPage = pageFilter === "all" || faq.page === pageFilter;
//     const matchesStatus = statusFilter === "all" ||
//       (statusFilter === "Published" && faq.published) ||
//       (statusFilter === "Draft" && !faq.published);
//     return matchesSearch && matchesPage && matchesStatus;
//   });

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold">FAQs</h1>
//         <Button><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>
//       </div>

//       <div className="flex flex-col md:flex-row gap-4 mb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
//         </div>
//         <select className="border rounded-md px-3 py-2" value={pageFilter} onChange={(e) => setPageFilter(e.target.value)}>
//           <option value="all">All Pages</option>
//           <option value="Services">Services</option>
//           <option value="Products">Products</option>
//           <option value="Contact">Contact</option>
//         </select>
//         <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="all">All Status</option>
//           <option value="Published">Published</option>
//           <option value="Draft">Draft</option>
//         </select>
//       </div>

//       <div className="space-y-3">
//         {filtered.map((faq) => (
//           <Card key={faq.id} className="rounded-xl">
//             <CardContent className="flex items-start justify-between py-4">
//               <div>
//                 <div className="flex items-center gap-2">
//                   <p className="font-medium">{faq.question}</p>
//                   <Badge variant={faq.published ? "secondary" : "outline"}>{faq.published ? "Published" : "Draft"}</Badge>
//                 </div>
//                 <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
//                 <p className="text-xs text-muted-foreground mt-1">Page: {faq.page} | Order: {faq.order}</p>
//               </div>
//               <div className="flex gap-1">
//                 <Button variant="ghost" size="icon-sm"><ArrowUp className="h-4 w-4" /></Button>
//                 <Button variant="ghost" size="icon-sm"><ArrowDown className="h-4 w-4" /></Button>
//                 <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
//                 <Button variant="ghost" size="icon-sm"><Trash className="h-4 w-4" /></Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }













import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { FaqsManager, type FaqRow } from "@/components/website/faqs-manager";

export default async function WebsiteFaqsPage() {
  await requirePermission("faqs.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <FaqsManager faqs={(data ?? []) as FaqRow[]} />;
}