// import "server-only";
// import { notFound } from "next/navigation";
// import { createClient } from "@/lib/supabase-server";
// import type { FeatureKey } from "@/lib/features-config";

// export async function requireFeatureEnabled(featureKey: FeatureKey) {
//   const supabase = await createClient();

//   const { data, error } = await supabase
//     .from("feature_settings")
//     .select("enabled")
//     .eq("feature_key", featureKey)
//     .maybeSingle();

//   if (error) {
//     throw new Error(error.message);
//   }

//   if (data && data.enabled === false) {
//     notFound();
//   }
// }





import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/auth/server";
import type { FeatureKey } from "@/lib/features-config";

export async function requireFeatureEnabled(featureKey: FeatureKey) {
  const profile = await getCurrentProfile();

  if (profile?.role === "superadmin") {
    return;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feature_settings")
    .select("enabled")
    .eq("feature_key", featureKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data && data.enabled === false) {
    notFound();
  }
}