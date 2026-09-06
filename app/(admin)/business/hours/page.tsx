



import {
  BusinessHoursManager,
  type BusinessHourRow,
} from "@/components/business/business-hours-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function BusinessHoursPage() {
  await requirePermission("businessHours.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("business_hours")
    .select("id, day_of_week, day_name, opens_at, closes_at, is_closed, is_24h")
    .order("day_of_week", { ascending: true });

  return <BusinessHoursManager hours={(data ?? []) as BusinessHourRow[]} />;
}