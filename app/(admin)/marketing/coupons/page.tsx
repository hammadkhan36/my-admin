// "use client";

// import { coupons } from "@/lib/marketing-data";
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
// import { Plus, Ticket } from "lucide-react";

// export default function CouponsPage() {
//   const stats = [
//     { label: "Active Coupons", value: "12" },
//     { label: "Total Uses", value: "3,456" },
//     { label: "Revenue Generated", value: "$24,800" },
//     { label: "Redemption Rate", value: "18.5%" },
//   ];

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold">Coupons</h1>
//         <Button>
//           <Plus className="mr-2 h-4 w-4" /> Create Coupon
//         </Button>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {stats.map((stat) => (
//           <Card key={stat.label}>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{stat.label}</CardTitle></CardHeader>
//             <CardContent><p className="text-2xl font-bold">{stat.value}</p></CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="rounded-xl border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Code</TableHead>
//               <TableHead>Discount</TableHead>
//               <TableHead>Uses</TableHead>
//               <TableHead>Usage Limit</TableHead>
//               <TableHead>Expiry</TableHead>
//               <TableHead>Status</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {coupons.map((coupon) => (
//               <TableRow key={coupon.id}>
//                 <TableCell className="font-medium">{coupon.code}</TableCell>
//                 <TableCell>
//                   {coupon.discountType === "Percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
//                 </TableCell>
//                 <TableCell>{coupon.uses}</TableCell>
//                 <TableCell>{coupon.usageLimit}</TableCell>
//                 <TableCell>{coupon.expiry}</TableCell>
//                 <TableCell>
//                   <Badge variant="outline">{coupon.status}</Badge>
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
import { CouponsManager, type CouponRow } from "@/components/marketing/coupons-manager";

export default async function CouponsPage() {
  await requirePermission("coupons.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, code, title, description, discount_type, discount_value, starts_at, ends_at, usage_limit, used_count, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <CouponsManager coupons={(data ?? []) as CouponRow[]} />;
}