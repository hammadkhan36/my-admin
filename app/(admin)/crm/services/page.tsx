// "use client";

// import * as React from "react";
// import { createClient } from "@/lib/supabase-browser";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Plus, Edit, Trash } from "lucide-react";
// import { toast } from "sonner";

// export default function ServicesPage() {
//   const supabase = createClient();
//   const [services, setServices] = React.useState<any[]>([]);
//   const [loading, setLoading] = React.useState(true);

//   const fetchServices = async () => {
//     setLoading(true);
//     const { data } = await supabase.from("services").select("*");
//     setServices(data || []);
//     setLoading(false);
//   };

//   React.useEffect(() => {
//     fetchServices();
//   }, []);

//   const handleDelete = async (id: string) => {
//     const { error } = await supabase.from("services").delete().eq("id", id);
//     if (error) {
//       toast.error("Failed to delete");
//       return;
//     }
//     toast.success("Service deleted");
//     fetchServices();
//   };

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold">Services</h1>
//         <Button><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
//       </div>
//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Price</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {services.map(s => (
//                 <TableRow key={s.id}>
//                   <TableCell>{s.name}</TableCell>
//                   <TableCell>{s.price}</TableCell>
//                   <TableCell>{s.category}</TableCell>
//                   <TableCell>{s.status}</TableCell>
//                   <TableCell className="text-right">
//                     <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
//                     <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(s.id)}><Trash className="h-4 w-4" /></Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }






import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { ServicesManager, type ServiceRow } from "@/components/services/services-manager";

export default async function CrmServicesPage() {
  await requirePermission("services.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <ServicesManager
      services={(data ?? []) as ServiceRow[]}
      title="CRM Services"
      description="Services used for leads and customer interest tracking."
    />
  );
}