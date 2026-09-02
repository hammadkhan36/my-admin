import { notFound } from "next/navigation";
import {
  LeadDetail,
  type LeadDetailRow,
  type LeadNoteRow,
  type LeadStatusHistoryRow,
} from "@/components/leads/lead-detail";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("leads.view");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: lead }, { data: notes }, { data: history }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        `
        id,
        customer_id,
        name,
        phone,
        email,
        service,
        message,
        source,
        status,
        priority,
        created_at,
        updated_at,
        customers:customer_id (
          id,
          name,
          phone,
          email
        )
      `
      )
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("lead_notes")
      .select(
        `
        id,
        note,
        created_at,
        profiles:created_by (
          full_name,
          email
        )
      `
      )
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),

    supabase
      .from("lead_status_history")
      .select(
        `
        id,
        old_status,
        new_status,
        created_at,
        profiles:changed_by (
          full_name,
          email
        )
      `
      )
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <LeadDetail
      lead={lead as LeadDetailRow}
      notes={(notes ?? []) as LeadNoteRow[]}
      history={(history ?? []) as LeadStatusHistoryRow[]}
    />
  );
}