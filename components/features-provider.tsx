// "use client";

// import * as React from "react";
// import { defaultFeatures, Features, FeatureKey } from "@/lib/features-config";

// type FeaturesContextType = {
//   features: Features;
//   toggleFeature: (key: FeatureKey) => void;
//   setFeature: (key: FeatureKey, value: boolean) => void;
// };

// const FeaturesContext = React.createContext<FeaturesContextType | null>(null);

// export function FeaturesProvider({ children }: { children: React.ReactNode }) {
//   const [features, setFeatures] = React.useState<Features>(defaultFeatures);

//   const toggleFeature = (key: FeatureKey) => {
//     setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const setFeature = (key: FeatureKey, value: boolean) => {
//     setFeatures((prev) => ({ ...prev, [key]: value }));
//   };

//   return (
//     <FeaturesContext.Provider value={{ features, toggleFeature, setFeature }}>
//       {children}
//     </FeaturesContext.Provider>
//   );
// }

// export function useFeatures() {
//   const context = React.useContext(FeaturesContext);
//   if (!context) {
//     throw new Error("useFeatures must be used within a FeaturesProvider");
//   }
//   return context;
// }







"use client";

import * as React from "react";
import { defaultFeatures, Features, FeatureKey } from "@/lib/features-config";

const STORAGE_KEY = "app_features";

type FeaturesContextType = {
  features: Features;
  toggleFeature: (key: FeatureKey) => void;
  setFeature: (key: FeatureKey, value: boolean) => void;
};

const FeaturesContext = React.createContext<FeaturesContextType | null>(null);

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  // Initial state: always defaultFeatures (no localStorage access)
  const [features, setFeatures] = React.useState<Features>(defaultFeatures);
  const [loaded, setLoaded] = React.useState(false);

  // Load from localStorage after mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setFeatures({ ...defaultFeatures, ...JSON.parse(saved) });
        } catch (e) {
          console.error("Failed to parse features from localStorage", e);
        }
      }
      setLoaded(true);
    }
  }, []);

  // Save to localStorage whenever features change (but only after loaded)
  React.useEffect(() => {
    if (loaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
    }
  }, [features, loaded]);

  const toggleFeature = (key: FeatureKey) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setFeature = (key: FeatureKey, value: boolean) => {
    setFeatures((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <FeaturesContext.Provider value={{ features, toggleFeature, setFeature }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  const context = React.useContext(FeaturesContext);
  if (!context) throw new Error("useFeatures must be used within a FeaturesProvider");
  return context;
}