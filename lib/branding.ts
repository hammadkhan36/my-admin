import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase-admin";
import { siteConfig } from "@/lib/site-config";

export type Branding = {
  name: string;
  shortName: string;
  logo: string | null;
};

// Public (login page) branding. Service role is used only to read these three columns.
export const getBranding = cache(async (): Promise<Branding> => {
  const fallback: Branding = {
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    logo: siteConfig.logo,
  };

  try {
    const { data } = await createAdminClient()
      .from("business_settings")
      .select("business_name, short_name, logo_url")
      .limit(1)
      .maybeSingle();

    if (!data) return fallback;

    const name = data.business_name?.trim() || fallback.name;
    return {
      name,
      shortName: data.short_name?.trim() || name,
      logo: data.logo_url?.trim() || null,
    };
  } catch {
    return fallback;
  }
});
