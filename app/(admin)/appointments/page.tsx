// // "use client";

// // import { useState } from "react";
// // import { appointments, Appointment, AppointmentStatus } from "@/lib/appointment-data";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Badge } from "@/components/ui/badge";
// // import { Card, CardContent } from "@/components/ui/card";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Search, Plus, Eye, Edit, CheckCircle, XCircle, CalendarClock } from "lucide-react";

// // export default function AppointmentsPage() {
// //   const [activeTab, setActiveTab] = useState("all");
// //   const [search, setSearch] = useState("");
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [staffFilter, setStaffFilter] = useState("all");
// //   const [serviceFilter, setServiceFilter] = useState("all");

// //   const statuses: AppointmentStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled", "No-show"];
// //   const staffList = Array.from(new Set(appointments.map((a) => a.staff)));
// //   const serviceList = Array.from(new Set(appointments.map((a) => a.service)));

// //   const filtered = appointments.filter((a) => {
// //     if (activeTab === "all") {
// //       // all appointments
// //     } else if (activeTab === "today") {
// //       const today = new Date().toISOString().split("T")[0]; // mock; real data aaj ki date
// //       if (a.date !== today) return false;
// //     } else if (activeTab === "upcoming") {
// //       if (a.status !== "Confirmed" && a.status !== "Pending") return false;
// //     } else if (activeTab === "completed") {
// //       if (a.status !== "Completed") return false;
// //     } else if (activeTab === "cancelled") {
// //       if (a.status !== "Cancelled") return false;
// //     } else if (activeTab === "no-show") {
// //       if (a.status !== "No-show") return false;
// //     } else if (activeTab === "pending") {
// //       if (a.status !== "Pending") return false;
// //     }

// //     const matchesSearch = a.customer.toLowerCase().includes(search.toLowerCase()) ||
// //       a.email.toLowerCase().includes(search.toLowerCase()) ||
// //       a.phone.includes(search);
// //     const matchesStatus = statusFilter === "all" || a.status === statusFilter;
// //     const matchesStaff = staffFilter === "all" || a.staff === staffFilter;
// //     const matchesService = serviceFilter === "all" || a.service === serviceFilter;
// //     return matchesSearch && matchesStatus && matchesStaff && matchesService;
// //   });

// //   const statusColor: Record<AppointmentStatus, string> = {
// //     Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
// //     Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
// //     Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
// //     Cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
// //     "No-show": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
// //   };

// //   return (
// //     <div className="p-4 md:p-6">
// //       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
// //         <h1 className="text-2xl font-bold">Appointments</h1>
// //         <Button>
// //           <Plus className="mr-2 h-4 w-4" /> Create Appointment
// //         </Button>
// //       </div>

// //       {/* Status Tabs */}
// //       <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
// //         <TabsList className="flex flex-wrap">
// //           <TabsTrigger value="all">All</TabsTrigger>
// //           <TabsTrigger value="today">Today</TabsTrigger>
// //           <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
// //           <TabsTrigger value="completed">Completed</TabsTrigger>
// //           <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
// //           <TabsTrigger value="no-show">No-show</TabsTrigger>
// //           <TabsTrigger value="pending">Pending</TabsTrigger>
// //         </TabsList>
// //       </Tabs>

// //       {/* Filters */}
// //       <div className="flex flex-col md:flex-row gap-4 mb-4">
// //         <div className="relative flex-1">
// //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //           <Input
// //             placeholder="Search appointments..."
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //             className="pl-10"
// //           />
// //         </div>
// //         <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
// //           <SelectTrigger className="w-[160px]">
// //             <SelectValue placeholder="Status" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="all">All Statuses</SelectItem>
// //             {statuses.map((s) => (
// //               <SelectItem key={s} value={s}>{s}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //         <Select value={staffFilter} onValueChange={(value) => setStaffFilter(value ?? "all")}>
// //           <SelectTrigger className="w-[160px]">
// //             <SelectValue placeholder="Staff" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="all">All Staff</SelectItem>
// //             {staffList.map((s) => (
// //               <SelectItem key={s} value={s}>{s}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //         <Select value={serviceFilter} onValueChange={(value) => setServiceFilter(value ?? "all")}>
// //           <SelectTrigger className="w-[160px]">
// //             <SelectValue placeholder="Service" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value="all">All Services</SelectItem>
// //             {serviceList.map((s) => (
// //               <SelectItem key={s} value={s}>{s}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //       </div>

// //       {/* Table */}
// //       <div className="rounded-xl border bg-card">
// //         <Table>
// //           <TableHeader>
// //             <TableRow>
// //               <TableHead>Customer</TableHead>
// //               <TableHead>Service</TableHead>
// //               <TableHead>Staff</TableHead>
// //               <TableHead>Date</TableHead>
// //               <TableHead>Time</TableHead>
// //               <TableHead>Duration</TableHead>
// //               <TableHead>Status</TableHead>
// //               <TableHead className="text-right">Actions</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {filtered.map((apt) => (
// //               <TableRow key={apt.id}>
// //                 <TableCell>
// //                   <div>
// //                     <p className="font-medium">{apt.customer}</p>
// //                     <p className="text-xs text-muted-foreground">{apt.email}</p>
// //                   </div>
// //                 </TableCell>
// //                 <TableCell>{apt.service}</TableCell>
// //                 <TableCell>{apt.staff}</TableCell>
// //                 <TableCell>{apt.date}</TableCell>
// //                 <TableCell>{apt.time}</TableCell>
// //                 <TableCell>{apt.duration} min</TableCell>
// //                 <TableCell>
// //                   <Badge className={statusColor[apt.status]}>{apt.status}</Badge>
// //                 </TableCell>
// //                 <TableCell className="text-right">
// //                   <div className="flex justify-end gap-1">
// //                     <Button variant="ghost" size="icon-sm" title="View"><Eye className="h-4 w-4" /></Button>
// //                     <Button variant="ghost" size="icon-sm" title="Edit"><Edit className="h-4 w-4" /></Button>
// //                     <Button variant="ghost" size="icon-sm" title="Confirm"><CheckCircle className="h-4 w-4 text-emerald-500" /></Button>
// //                     <Button variant="ghost" size="icon-sm" title="Cancel"><XCircle className="h-4 w-4 text-red-500" /></Button>
// //                     <Button variant="ghost" size="icon-sm" title="Reschedule"><CalendarClock className="h-4 w-4" /></Button>
// //                   </div>
// //                 </TableCell>
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //       </div>
// //     </div>
// //   );
// // }














// // this new code fetch from supabase and displays the appointments in a table with filters and tabs for different statuses. It also includes buttons for viewing, editing, confirming, canceling, and rescheduling appointments.



// "use client";

// import { useEffect, useState } from "react";
// import { createClient } from "@/lib/supabase-browser";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Search, Plus, Eye, Edit, CheckCircle, XCircle, CalendarClock } from "lucide-react";
// import { toast } from "sonner";

// type Appointment = {
//   id: string;
//   customer_id: string;
//   customer: { name: string; phone: string; email?: string };
//   service: { name: string };
//   staff: string;
//   date: string;
//   time: string;
//   duration: number;
//   status: string;
//   source: string;
// };

// export default function AppointmentsPage() {
//   const supabase = createClient();
//   const router = useRouter();
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [activeTab, setActiveTab] = useState("all");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAppointments();
//   }, []);

//   const fetchAppointments = async () => {
//     setLoading(true);
//     let query = supabase
//       .from('appointments')
//       .select(`
//         *,
//         customer:customers(name, phone, email),
//         service:appointment_services(name)
//       `)
//       .order('date', { ascending: true });

//     const { data, error } = await query;
//     if (error) {
//       toast.error("Failed to load appointments");
//       setLoading(false);
//       return;
//     }
//     setAppointments(data || []);
//     setLoading(false);
//   };

//   // Filtering based on search, status, tabs (today, upcoming, etc.)
//   const filtered = appointments.filter((apt) => {
//     const matchesSearch = apt.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
//       apt.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
//       apt.staff?.toLowerCase().includes(search.toLowerCase());
//     const matchesStatus = statusFilter === "all" || apt.status === statusFilter;

//     // Tab filters
//     const today = new Date().toISOString().split("T")[0];
//     if (activeTab === "today") {
//       if (apt.date !== today) return false;
//     } else if (activeTab === "upcoming") {
//       if (apt.status !== "Confirmed" && apt.status !== "Pending") return false;
//     } else if (activeTab === "completed") {
//       if (apt.status !== "Completed") return false;
//     } else if (activeTab === "cancelled") {
//       if (apt.status !== "Cancelled") return false;
//     } else if (activeTab === "no-show") {
//       if (apt.status !== "No-show") return false;
//     } else if (activeTab === "pending") {
//       if (apt.status !== "Pending") return false;
//     }

//     return matchesSearch && matchesStatus;
//   });

//   const statusColor: Record<string, string> = {
//     Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
//     Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
//     Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
//     Cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
//     "No-show": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
//   };

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold">Appointments</h1>
//         <Button onClick={() => router.push("/appointments/create")}>
//           <Plus className="mr-2 h-4 w-4" /> Create Appointment
//         </Button>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
//         <TabsList className="flex flex-wrap">
//           <TabsTrigger value="all">All</TabsTrigger>
//           <TabsTrigger value="today">Today</TabsTrigger>
//           <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
//           <TabsTrigger value="completed">Completed</TabsTrigger>
//           <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
//           <TabsTrigger value="no-show">No-show</TabsTrigger>
//           <TabsTrigger value="pending">Pending</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       <div className="flex flex-col md:flex-row gap-4 mb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
//         </div>
//         <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
//           <SelectTrigger className="w-[160px]">
//             <SelectValue placeholder="Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="Pending">Pending</SelectItem>
//             <SelectItem value="Confirmed">Confirmed</SelectItem>
//             <SelectItem value="Completed">Completed</SelectItem>
//             <SelectItem value="Cancelled">Cancelled</SelectItem>
//             <SelectItem value="No-show">No-show</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="rounded-xl border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Customer</TableHead>
//               <TableHead>Service</TableHead>
//               <TableHead>Staff</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Time</TableHead>
//               <TableHead>Duration</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filtered.map((apt) => (
//               <TableRow key={apt.id}>
//                 <TableCell>
//                   <div>
//                     <p className="font-medium">{apt.customer?.name}</p>
//                     <p className="text-xs text-muted-foreground">{apt.customer?.phone}</p>
//                   </div>
//                 </TableCell>
//                 <TableCell>{apt.service?.name}</TableCell>
//                 <TableCell>{apt.staff}</TableCell>
//                 <TableCell>{apt.date}</TableCell>
//                 <TableCell>{apt.time}</TableCell>
//                 <TableCell>{apt.duration} min</TableCell>
//                 <TableCell>
//                   <Badge className={statusColor[apt.status]}>{apt.status}</Badge>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-1">
//                     <Button variant="ghost" size="icon-sm" onClick={() => router.push(`/appointments/${apt.id}`)}>
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
//                     <Button variant="ghost" size="icon-sm"><CheckCircle className="h-4 w-4 text-emerald-500" /></Button>
//                     <Button variant="ghost" size="icon-sm"><XCircle className="h-4 w-4 text-red-500" /></Button>
//                     <Button variant="ghost" size="icon-sm"><CalendarClock className="h-4 w-4" /></Button>
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
import {
  AppointmentsManager,
  type AppointmentRow,
} from "@/components/appointments/appointments-manager";

type ServiceOption = {
  id: string;
  name: string;
};

export default async function AppointmentsPage() {
  await requirePermission("appointments.view");

  const supabase = await createClient();

  const [{ data: appointments, error: appointmentsError }, { data: services, error: servicesError }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select(
          `
          id,
          customer_name,
          customer_phone,
          customer_email,
          appointment_date,
          appointment_time,
          status,
          source,
          notes,
          services:service_id (
            name
          )
        `
        )
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true }),

      supabase
        .from("services")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

  if (appointmentsError) throw new Error(appointmentsError.message);
  if (servicesError) throw new Error(servicesError.message);

  return (
    <AppointmentsManager
      appointments={(appointments ?? []).map((appointment) => ({
        ...appointment,
        services: {
          name: appointment.services?.[0]?.name ?? "",
        },
      })) as AppointmentRow[]}
      services={(services ?? []) as ServiceOption[]}
    />
  );
}