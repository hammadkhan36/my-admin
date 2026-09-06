

import {
  LeadsManager,
  type LeadRow,
} from "@/components/leads/leads-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function LeadsPage() {
  await requirePermission("leads.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("leads")
    .select(
      "id, customer_id, name, phone, email, service, message, source, status, priority, page_url, referrer, utm_source, utm_medium, utm_campaign, created_at"
    )
    .order("created_at", { ascending: false });

  return <LeadsManager leads={(data ?? []) as LeadRow[]} />;
}