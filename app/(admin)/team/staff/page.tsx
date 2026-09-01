// "use client";

// import { useState } from "react";
// import { staff, Staff } from "@/lib/team-data";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Plus,
//   Edit,
//   Trash,
//   UserCog,
// } from "lucide-react";

// export default function StaffPage() {
//   const [staffList, setStaffList] = useState<Staff[]>(staff);

//   const totalStaff = staffList.length;
//   const activeStaff = staffList.filter((s) => s.status === "Active").length;
//   const inactiveStaff = staffList.filter((s) => s.status === "Inactive").length;

//   const deactivateStaff = (id: string) => {
//     setStaffList(
//       staffList.map((s) =>
//         s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
//       )
//     );
//   };

//   const deleteStaff = (id: string) => {
//     setStaffList(staffList.filter((s) => s.id !== id));
//   };

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold">Staff</h1>
//         <Button>
//           <Plus className="mr-2 h-4 w-4" /> Add Staff
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">{totalStaff}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-emerald-600">{activeStaff}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-red-600">{inactiveStaff}</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Staff Table */}
//       <div className="rounded-xl border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Email</TableHead>
//               <TableHead>Role</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Last Active</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {staffList.map((member) => (
//               <TableRow key={member.id}>
//                 <TableCell className="font-medium">{member.name}</TableCell>
//                 <TableCell>{member.email}</TableCell>
//                 <TableCell>
//                   <Badge variant="outline">{member.role}</Badge>
//                 </TableCell>
//                 <TableCell>
//                   <Badge variant={member.status === "Active" ? "secondary" : "outline"}>
//                     {member.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>{member.lastActive}</TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-1">
//                     <Button variant="ghost" size="icon-sm" title="Edit">
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon-sm" title="Assign Role">
//                       <UserCog className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon-sm"
//                       title={member.status === "Active" ? "Deactivate" : "Activate"}
//                       onClick={() => deactivateStaff(member.id)}
//                     >
//                       {member.status === "Active" ? (
//                         <Trash className="h-4 w-4 text-red-500" />
//                       ) : (
//                         <Badge variant="outline">Activate</Badge>
//                       )}
//                     </Button>
//                     <Button variant="ghost" size="icon-sm" title="Delete" onClick={() => deleteStaff(member.id)}>
//                       <Trash className="h-4 w-4" />
//                     </Button>
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







// Iska kaam: server par permission check hogi, phir members list fetch hogi, 
// phir UI component ko data milega.



import {
  StaffManager,
  type TeamMember,
} from "@/components/team/staff-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function StaffPage() {
  await requirePermission("staff.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return <StaffManager members={(data ?? []) as TeamMember[]} />;
}