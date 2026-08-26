
import { masterConfig } from "@/lib/master-config";


export type FeatureKey =
  | "dashboard"
  | "leads"
  | "customers"
  | "appointments"
  | "calendar"
  | "campaigns"
  | "offers"
  | "coupons"
  | "referrals"
  | "reviews"
  | "testimonials"
  | "gallery"
  | "services"
  | "products"
  | "pages"
  | "faqs"
  | "media"
  | "seo"
  | "analytics"
  | "trafficSources"
  | "reports"
  | "businessProfile"
  | "serviceAreas"
  | "businessHours"
  | "staff"
  | "roles"
  | "activityLogs"
  | "settings"
  | "forms"
  | "followUps"
  | "leadSources"
  | "notifications";

export type Features = Record<FeatureKey, boolean>;

// Default: Sab ON (business apni marzi se off karega)
export const defaultFeatures: Features = {
  dashboard: true,
  leads: true,
  customers: true,
  appointments: true,
  calendar: true,
  campaigns: true,
  offers: true,
  coupons: true,
  referrals: true,
  reviews: true,
  testimonials: true,
  gallery: true,
  services: true,
  products: true,
  pages: true,
  faqs: true,
  media: true,
  seo: true,
  analytics: true,
  trafficSources: true,
  reports: true,
  businessProfile: true,
  serviceAreas: true,
  businessHours: true,
  staff: true,
  roles: true,
  activityLogs: true,
  settings: true,
  notifications: true,
  forms: true,
  followUps: true,
  leadSources: true,
};

// Locked features check
export function isFeatureLocked(key: FeatureKey): boolean {
  const lock = masterConfig.lockedFeatures.find((l) => l.key === key);
  return lock?.locked ?? false;
}

export function getUnlockCode(key: FeatureKey): string | undefined {
  const lock = masterConfig.lockedFeatures.find((l) => l.key === key);
  return lock?.unlockCode;
}

// Settings page grouping
export const featureGroups: { label: string; items: { key: FeatureKey; label: string }[] }[] = [
  {
    label: "Core",
    items: [
      { key: "dashboard", label: "Dashboard" },
      { key: "leads", label: "CRM (Leads & Customers)" },
    ],
  },
  {
    label: "Customer Growth",
    items: [
      { key: "leads", label: "Leads" },
      { key: "customers", label: "Customers" },
      { key: "appointments", label: "Appointments" },
      { key: "calendar", label: "Calendar" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { key: "campaigns", label: "Campaigns" },
      { key: "offers", label: "Offers" },
      { key: "coupons", label: "Coupons" },
      { key: "referrals", label: "Referrals" },
    ],
  },
  {
    label: "Reputation",
    items: [
      { key: "reviews", label: "Reviews" },
      { key: "testimonials", label: "Testimonials" },
      { key: "gallery", label: "Customer Gallery" },
    ],
  },
  {
    label: "Website",
    items: [
      { key: "services", label: "Services" },
      { key: "products", label: "Products" },
      { key: "pages", label: "Pages" },
      { key: "faqs", label: "FAQs" },
      { key: "media", label: "Media" },
      { key: "seo", label: "SEO" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { key: "analytics", label: "Analytics" },
      { key: "trafficSources", label: "Traffic Sources" },
      { key: "reports", label: "Reports" },
    ],
  },
  {
    label: "Business & Team",
    items: [
      { key: "businessProfile", label: "Business Profile" },
      { key: "serviceAreas", label: "Service Areas" },
      { key: "businessHours", label: "Business Hours" },
      { key: "staff", label: "Staff" },
      { key: "roles", label: "Roles & Permissions" },
    ],
  },
  {
    label: "System",
    items: [
      { key: "activityLogs", label: "Activity Logs" },
      { key: "notifications", label: "Notifications" },
      { key: "settings", label: "Settings" },
    ],
  },
];