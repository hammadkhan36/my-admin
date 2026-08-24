// export type FeatureLock = {
//   key: string;
//   locked: boolean;
//   unlockCode?: string; // secret code provided by us
// };

// export type SubscriptionPlan = "one-time" | "monthly" | "half-yearly" | "yearly";

// export type SubscriptionInfo = {
//   plan: SubscriptionPlan;
//   startDate: string;
//   endDate: string; // expiry date
//   gracePeriodDays: number;
//   isActive: boolean;
// };

// export const masterConfig = {
//   superAdmin: {
//     username: "superadmin", // change in production
//     password: "super-secret-password", // should be hashed in backend
//   },
//   lockedFeatures: [
//     { key: "appointments", locked: true, unlockCode: "APPT2024" },
//     { key: "calendar", locked: true, unlockCode: "CAL2024" },
//     { key: "campaigns", locked: true, unlockCode: "MKT2024" },
//     { key: "coupons", locked: false, unlockCode: "" },
//     { key: "reports", locked: true, unlockCode: "RPT2024" },
//   ] as FeatureLock[],
//   subscription: {
//     plan: "monthly",
//     startDate: "2024-06-01",
//     endDate: "2024-06-30",
//     gracePeriodDays: 7,
//     isActive: true,
//   } as SubscriptionInfo,
// };




export type FeatureLock = {
    key: string;
    locked: boolean;
    unlockCode?: string;
};

export type SubscriptionPlan = "one-time" | "monthly" | "half-yearly" | "yearly" | "lifetime";

export type SubscriptionInfo = {
    plan: SubscriptionPlan;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD   // ignored if plan is lifetime
    gracePeriodDays: number;
    isActive: boolean;
};

export type MasterConfig = {
    superAdmin: {
        username: string;
        password: string; // production mein hash karo
    };
    lockedFeatures: FeatureLock[];
    subscription: SubscriptionInfo;
     renewalCode: string; 
};

export const masterConfig: MasterConfig = {
    superAdmin: {
        username: "superadmin",
        password: "admin123", // change this
    },
    lockedFeatures: [
        { key: "appointments", locked: true, unlockCode: "APPT2024" },
        { key: "calendar", locked: true, unlockCode: "CAL2024" },
        { key: "campaigns", locked: true, unlockCode: "MKT2024" },
        { key: "coupons", locked: false, unlockCode: "" },
        { key: "reports", locked: true, unlockCode: "RPT2024" },
    ],
    subscription: {
        plan: "lifetime",   // ← default lifetime so no expiry
        startDate: "2024-06-01",
        endDate: "2030-12-31",  // future date so initially active
        gracePeriodDays: 7,
        isActive: true,
    },
    renewalCode: "RENEW2024", // default renewal code
};

// Keys for localStorage
export const STORAGE_KEYS = {
    adminConfig: "admin_config_overrides",
    features: "app_features",
    unlockedFeatures: "app_unlocked_features",
};