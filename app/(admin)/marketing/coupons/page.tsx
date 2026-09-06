

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