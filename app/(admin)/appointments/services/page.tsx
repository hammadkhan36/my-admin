// "use client";

// import { appointmentServices } from "@/lib/appointment-data";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Plus, Edit, Trash } from "lucide-react";

// export default function AppointmentServicesPage() {
//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold">Appointment Services</h1>
//         <Button>
//           <Plus className="mr-2 h-4 w-4" /> Add Service
//         </Button>
//       </div>

//       <div className="rounded-xl border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Service Name</TableHead>
//               <TableHead>Duration</TableHead>
//               <TableHead>Price</TableHead>
//               <TableHead>Staff</TableHead>
//               <TableHead>Availability</TableHead>
//               <TableHead>Buffer Time</TableHead>
//               <TableHead>Booking Status</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {appointmentServices.map((service) => (
//               <TableRow key={service.id}>
//                 <TableCell className="font-medium">{service.name}</TableCell>
//                 <TableCell>{service.duration} min</TableCell>
//                 <TableCell>Rs. {service.price.toLocaleString()}</TableCell>
//                 <TableCell>{service.staff}</TableCell>
//                 <TableCell>{service.availability}</TableCell>
//                 <TableCell>{service.bufferTime} min</TableCell>
//                 <TableCell>
//                   <Badge variant={service.bookingStatus === "Active" ? "secondary" : "outline"}>
//                     {service.bookingStatus}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-1">
//                     <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
//                     <Button variant="ghost" size="icon-sm"><Trash className="h-4 w-4 text-red-500" /></Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }












import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { ServicesManager, type ServiceRow } from "@/components/services/services-manager";

export default async function AppointmentServicesPage() {
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
      title="Appointment Services"
      description="Services used for appointment duration, pricing and booking setup."
    />
  );
}