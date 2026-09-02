// "use client";

// import { useState } from "react";
// import { serviceAreas, ServiceArea } from "@/lib/business-data";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Plus, Search, Trash, MapPin, ToggleLeft, ToggleRight } from "lucide-react";

// export default function ServiceAreasPage() {
//   const [areas, setAreas] = useState<ServiceArea[]>(serviceAreas);
//   const [search, setSearch] = useState("");
//   const [newArea, setNewArea] = useState("");

//   const filtered = areas.filter((area) =>
//     area.areaName.toLowerCase().includes(search.toLowerCase())
//   );

//   const addArea = () => {
//     if (newArea.trim()) {
//       const newAreaObj: ServiceArea = {
//         id: Date.now().toString(),
//         areaName: newArea.trim(),
//         serviceAvailability: "Full",
//         status: "Active",
//       };
//       setAreas([...areas, newAreaObj]);
//       setNewArea("");
//     }
//   };

//   const removeArea = (id: string) => {
//     setAreas(areas.filter((area) => area.id !== id));
//   };

//   const toggleStatus = (id: string) => {
//     setAreas(
//       areas.map((area) =>
//         area.id === id
//           ? { ...area, status: area.status === "Active" ? "Inactive" : "Active" }
//           : area
//       )
//     );
//   };

//   return (
//     <div className="p-4 md:p-6">
//       <h1 className="text-2xl font-bold mb-6">Service Areas</h1>

//       {/* Add Area */}
//       <Card className="mb-6">
//         <CardContent className="flex flex-col sm:flex-row gap-4 py-4">
//           <div className="relative flex-1">
//             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Add new area (e.g., Attock)"
//               value={newArea}
//               onChange={(e) => setNewArea(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <Button onClick={addArea}>
//             <Plus className="mr-2 h-4 w-4" /> Add Area
//           </Button>
//         </CardContent>
//       </Card>

//       {/* Search */}
//       <div className="relative mb-4">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           placeholder="Search areas..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="pl-10"
//         />
//       </div>

//       {/* Areas Table */}
//       <div className="rounded-xl border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Area Name</TableHead>
//               <TableHead>Service Availability</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filtered.map((area) => (
//               <TableRow key={area.id}>
//                 <TableCell className="font-medium">{area.areaName}</TableCell>
//                 <TableCell>{area.serviceAvailability}</TableCell>
//                 <TableCell>
//                   <Badge variant={area.status === "Active" ? "secondary" : "outline"}>
//                     {area.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-1">
//                     <Button variant="ghost" size="icon-sm" onClick={() => toggleStatus(area.id)}>
//                       {area.status === "Active" ? (
//                         <ToggleRight className="h-4 w-4 text-emerald-500" />
//                       ) : (
//                         <ToggleLeft className="h-4 w-4 text-muted-foreground" />
//                       )}
//                     </Button>
//                     <Button variant="ghost" size="icon-sm" onClick={() => removeArea(area.id)}>
//                       <Trash className="h-4 w-4 text-red-500" />
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Map Placeholder */}
//       <Card className="mt-6">
//         <CardContent className="py-12 text-center text-muted-foreground">
//           <MapPin className="mx-auto h-8 w-8 mb-2" />
//           Map integration will appear here (Google Maps placeholder).
//         </CardContent>
//       </Card>
//     </div>
//   );
// }







import {
  ServiceAreasManager,
  type ServiceAreaRow,
} from "@/components/business/service-areas-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function ServiceAreasPage() {
  await requirePermission("serviceAreas.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("service_areas")
    .select("id, area_name, city, is_active, sort_order")
    .order("sort_order", { ascending: true })
    .order("area_name", { ascending: true });

  return <ServiceAreasManager areas={(data ?? []) as ServiceAreaRow[]} />;
}