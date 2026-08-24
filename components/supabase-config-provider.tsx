"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type BusinessSettings = {
  id: string;
  business_name: string | null;
  short_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  theme_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  social_links: any;
};

type FeatureSetting = {
  feature_key: string;
  enabled: boolean;
  locked: boolean;
  unlock_code: string | null;
};

type Subscription = {
  id: string;
  plan: string;
  start_date: string | null;
  end_date: string | null;
  grace_period_days: number;
  is_active: boolean;
  renewal_code: string | null;
};

type SupabaseConfigContextType = {
  businessSettings: BusinessSettings | null;
  featureSettings: FeatureSetting[];
  subscription: Subscription | null;
  refreshData: () => Promise<void>;
  updateBusinessSetting: (field: string, value: string) => Promise<void>;
  updateFeatureSetting: (key: string, enabled: boolean, locked: boolean, unlockCode?: string | null) => Promise<void>;
  updateSubscription: (sub: Partial<Subscription>) => Promise<void>;
};

const SupabaseConfigContext = React.createContext<SupabaseConfigContextType | null>(null);

export function SupabaseConfigProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [businessSettings, setBusinessSettings] = React.useState<BusinessSettings | null>(null);
  const [featureSettings, setFeatureSettings] = React.useState<FeatureSetting[]>([]);
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);

  const refreshData = async () => {
    try {
      const { data: bs } = await supabase
        .from("business_settings")
        .select("*")
        .limit(1)
        .single();
      const { data: fs } = await supabase.from("feature_settings").select("*");
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .limit(1)
        .single();
      if (bs) setBusinessSettings(bs);
      if (fs) setFeatureSettings(fs);
      if (sub) setSubscription(sub);
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  const updateBusinessSetting = async (field: string, value: string) => {
    if (!businessSettings) return;
    const { error } = await supabase
      .from("business_settings")
      .update({ [field]: value })
      .eq("id", businessSettings.id);
    if (error) throw error;
    await refreshData();
  };

  const updateFeatureSetting = async (
    key: string,
    enabled: boolean,
    locked: boolean,
    unlockCode?: string | null
  ) => {
    const { error } = await supabase
      .from("feature_settings")
      .update({ enabled, locked, unlock_code: unlockCode })
      .eq("feature_key", key);
    if (error) throw error;
    await refreshData();
  };

  const updateSubscription = async (sub: Partial<Subscription>) => {
    if (!subscription) return;
    const { error } = await supabase
      .from("subscriptions")
      .update(sub)
      .eq("id", subscription.id);
    if (error) throw error;
    await refreshData();
  };

  return (
    <SupabaseConfigContext.Provider
      value={{
        businessSettings,
        featureSettings,
        subscription,
        refreshData,
        updateBusinessSetting,
        updateFeatureSetting,
        updateSubscription,
      }}
    >
      {children}
    </SupabaseConfigContext.Provider>
  );
}

export function useSupabaseConfig() {
  const context = React.useContext(SupabaseConfigContext);
  if (!context) throw new Error("useSupabaseConfig must be used within SupabaseConfigProvider");
  return context;
}