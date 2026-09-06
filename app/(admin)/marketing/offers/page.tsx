


import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { OffersManager, type OfferRow } from "@/components/marketing/offers-manager";

export default async function OffersPage() {
  await requirePermission("offers.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, description, discount_label, starts_at, ends_at, cta_label, cta_url, image_url, is_active, sort_order, created_at"
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <OffersManager offers={(data ?? []) as OfferRow[]} />;
}