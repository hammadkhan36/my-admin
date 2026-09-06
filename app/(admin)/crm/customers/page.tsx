


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