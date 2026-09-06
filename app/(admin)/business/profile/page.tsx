


import {
  BusinessProfileForm,
  type BusinessProfileRow,
} from "@/components/business/business-profile-form";
import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";

export default async function BusinessProfilePage() {
  await requirePermission("businessProfile.view");

  const supabase = await createClient();

  const { data } = await supabase
    .from("business_settings")
    .select(
      "id, business_name, short_name, logo_url, favicon_url, theme_color, contact_email, contact_phone, address"
    )
    .limit(1)
    .single();

  if (!data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Business settings row not found.
      </div>
    );
  }

  return <BusinessProfileForm business={data as BusinessProfileRow} />;
}