
import {
  ServiceAreasManager,
  type ServiceAreaRow,
} from "@/components/business/service-areas-manager";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function ServiceAreasPage() {
  await requirePermission("serviceAreas.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("service_areas")
    .select("id, area_name, city, is_active, sort_order")
    .order("sort_order", { ascending: true })
    .order("area_name", { ascending: true });

  return <ServiceAreasManager areas={(data ?? []) as ServiceAreaRow[]} />;
}