




import { notFound } from "next/navigation";
import {
  CustomerDetail,
  type CustomerActivityRow,
  type CustomerDetailRow,
} from "@/components/customers/customer-detail";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("customers.view");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: customer }, { data: activities }] = await Promise.all([
    supabase
      .from("customers")
      .select(
        "id, name, phone, email, address, notes, tags, last_seen_at, created_at, updated_at"
      )
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("audit_logs")
      .select("id, event_type, details, created_at")
      .eq("target_type", "customer")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerDetail
      customer={customer as CustomerDetailRow}
      activities={(activities ?? []) as CustomerActivityRow[]}
    />
  );
}