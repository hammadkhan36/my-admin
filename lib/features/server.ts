import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { FeatureKey } from "@/lib/features-config";

export async function requireFeatureEnabled(featureKey: FeatureKey) {
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