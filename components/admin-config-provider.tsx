"use client";

import * as React from "react";
import { masterConfig, MasterConfig, SubscriptionInfo, FeatureLock } from "@/lib/master-config";

const ADMIN_CONFIG_STORAGE_KEY = "admin_config_overrides";

type AdminConfigContextType = {
  config: MasterConfig;
  updateSubscription: (newSub: Partial<SubscriptionInfo>) => void;
  updateLockFeature: (key: string, locked: boolean, unlockCode?: string) => void;
  getLockedFeature: (key: string) => FeatureLock | undefined;
  isUnlocked: (key: string) => boolean;
};

const AdminConfigContext = React.createContext<AdminConfigContextType | null>(null);

export function AdminConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<MasterConfig>(masterConfig);
  const [loaded, setLoaded] = React.useState(false);

  // Load saved overrides from localStorage after mount
  React.useEffect(() => {
    const saved = localStorage.getItem(ADMIN_CONFIG_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<MasterConfig>;
        setConfig((prev) => ({
          ...prev,
          ...parsed,
          superAdmin: { ...prev.superAdmin, ...(parsed.superAdmin || {}) },
          subscription: { ...prev.subscription, ...(parsed.subscription || {}) },
          lockedFeatures: parsed.lockedFeatures || prev.lockedFeatures,
        }));
      } catch (e) {
        console.error("Failed to parse admin config overrides", e);
      }
    }
    setLoaded(true); // mark as loaded
  }, []);

  // Save to localStorage only after initial load has completed
  React.useEffect(() => {
    if (loaded) {
      localStorage.setItem(ADMIN_CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, loaded]);

  const updateSubscription = (newSub: Partial<SubscriptionInfo>) => {
    setConfig((prev) => ({
      ...prev,
      subscription: { ...prev.subscription, ...newSub },
    }));
  };

  const updateLockFeature = (key: string, locked: boolean, unlockCode?: string) => {
    setConfig((prev) => ({
      ...prev,
      lockedFeatures: prev.lockedFeatures.map((lf) =>
        lf.key === key ? { ...lf, locked, unlockCode: unlockCode ?? lf.unlockCode } : lf
      ),
    }));
  };

  const getLockedFeature = (key: string) => {
    return config.lockedFeatures.find((lf) => lf.key === key);
  };

  const isUnlocked = (key: string) => {
    const lock = getLockedFeature(key);
    if (!lock) return true;
    const unlocked = JSON.parse(localStorage.getItem("app_unlocked_features") || "{}");
    return !!unlocked[key];
  };

  return (
    <AdminConfigContext.Provider value={{ config, updateSubscription, updateLockFeature, getLockedFeature, isUnlocked }}>
      {children}
    </AdminConfigContext.Provider>
  );
}

export function useAdminConfig() {
  const context = React.useContext(AdminConfigContext);
  if (!context) throw new Error("useAdminConfig must be used within AdminConfigProvider");
  return context;
}