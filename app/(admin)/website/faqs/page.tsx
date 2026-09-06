


import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { FaqsManager, type FaqRow } from "@/components/website/faqs-manager";

export default async function WebsiteFaqsPage() {
  await requirePermission("faqs.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <FaqsManager faqs={(data ?? []) as FaqRow[]} />;
}