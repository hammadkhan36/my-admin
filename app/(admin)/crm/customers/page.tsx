// // "use client";

// // import { customers } from "@/lib/crm-data";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// // import { Badge } from "@/components/ui/badge";
// // import { Input } from "@/components/ui/input";
// // import { Search } from "lucide-react";

// // export default function CustomersPage() {
// //   const stats = [
// //     { label: "Total Customers", value: "1,234" },
// //     { label: "New This Month", value: "87" },
// //     { label: "Returning Customers", value: "642" },
// //     { label: "VIP Customers", value: "48" },
// //   ];

// //   return (
// //     <div className="p-4 md:p-6">
// //       <h1 className="text-2xl font-bold mb-6">Customers</h1>

// //       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
// //         {stats.map((stat) => (
// //           <Card key={stat.label}>
// //             <CardHeader className="pb-2">
// //               <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <p className="text-2xl font-bold">{stat.value}</p>
// //             </CardContent>
// //           </Card>
// //         ))}
// //       </div>

// //       <div className="flex justify-between gap-4 mb-4">
// //         <div className="relative flex-1">
// //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //           <Input placeholder="Search customers..." className="pl-10" />
// //         </div>
// //       </div>

// //       <div className="rounded-xl border bg-card">
// //         <Table>
// //           <TableHeader>
// //             <TableRow>
// //               <TableHead>Name</TableHead>
// //               <TableHead>Email</TableHead>
// //               <TableHead>Phone</TableHead>
// //               <TableHead>Tags</TableHead>
// //               <TableHead>Last Activity</TableHead>
// //               <TableHead>Status</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {customers.map((customer) => (
// //               <TableRow key={customer.id}>
// //                 <TableCell className="font-medium">{customer.name}</TableCell>
// //                 <TableCell>{customer.email}</TableCell>
// //                 <TableCell>{customer.phone}</TableCell>
// //                 <TableCell>
// //                   <div className="flex gap-1">
// //                     {customer.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
// //                   </div>
// //                 </TableCell>
// //                 <TableCell>{customer.lastActivity}</TableCell>
// //                 <TableCell><Badge variant="outline">{customer.status}</Badge></TableCell>
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //       </div>
// //     </div>
// //   );
// // }






// "use client";

// import * as React from "react";
// import { createClient } from "@/lib/supabase-browser";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
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
// import { Search, Plus, MoreHorizontal } from "lucide-react";
// import { toast } from "sonner";
// import { format } from "date-fns";

// type Customer = {
//   id: string;
//   name: string;
//   phone: string;
//   email: string | null;
//   first_source: string | null;
//   last_activity: string;
//   status: string;
//   tags: string[];
// };

// export default function CustomersPage() {
//   const supabase = createClient();
//   const router = useRouter();
//   const [customers, setCustomers] = React.useState<Customer[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [search, setSearch] = React.useState("");

//   React.useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const fetchCustomers = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("customers")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (error) {
//       toast.error("Failed to load customers");
//       setLoading(false);
//       return;
//     }
//     setCustomers(data || []);
//     setLoading(false);
//   };

//   const filtered = customers.filter((c) =>
//     c.name.toLowerCase().includes(search.toLowerCase()) ||
//     c.phone.includes(search) ||
//     (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
//   );

//   const totalCustomers = customers.length;
//   const activeCustomers = customers.filter((c) => c.status === "Active").length;

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold">Customers</h1>
//         <Button onClick={() => router.push("/crm/customers/create")}>
//           <Plus className="mr-2 h-4 w-4" /> Add Customer
//         </Button>
//       </div>

//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">{totalCustomers}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-emerald-600">{activeCustomers}</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="relative mb-4">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           placeholder="Search customers..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="pl-10"
//         />
//       </div>

//       <div className="rounded-xl border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Phone</TableHead>
//               <TableHead>Email</TableHead>
//               <TableHead>First Source</TableHead>
//               <TableHead>Last Activity</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
//             ) : filtered.length === 0 ? (
//               <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No customers found</TableCell></TableRow>
//             ) : (
//               filtered.map((customer) => (
//                 <TableRow key={customer.id}>
//                   <TableCell className="font-medium">{customer.name}</TableCell>
//                   <TableCell>{customer.phone}</TableCell>
//                   <TableCell>{customer.email || "-"}</TableCell>
//                   <TableCell>{customer.first_source || "-"}</TableCell>
//                   <TableCell className="text-muted-foreground">
//                     {format(new Date(customer.last_activity), "PP")}
//                   </TableCell>
//                   <TableCell>
//                     <Badge variant="outline">{customer.status}</Badge>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <Button variant="ghost" size="icon-sm" onClick={() => router.push(`/crm/customers/${customer.id}`)}>
//                       <MoreHorizontal className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }









import {
  CustomerManager,
  type CustomerRow,
} from "@/components/customers/customer-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function CustomersPage() {
  await requirePermission("customers.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("customers")
    .select("id, name, phone, email, address, notes, tags, last_seen_at, created_at")
    .order("created_at", { ascending: false });

  return <CustomerManager customers={(data ?? []) as CustomerRow[]} />;
}