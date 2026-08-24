export type ActivityLog = {
  id: string;
  user: string;
  action: string;
  module: string;
  details: string;
  dateTime: string;
};

export const activityLogs: ActivityLog[] = [
  { id: "1", user: "Hammad", action: "Updated Lead", module: "CRM", details: "Changed status New → Contacted", dateTime: "2024-05-20 14:32" },
  { id: "2", user: "Sara", action: "Created Campaign", module: "Marketing", details: "Created 'Summer Sale' campaign", dateTime: "2024-05-20 11:15" },
  { id: "3", user: "Ali", action: "Approved Review", module: "Reputation", details: "Approved 5-star review from John", dateTime: "2024-05-19 16:45" },
  { id: "4", user: "Ayesha", action: "Updated Settings", module: "System", details: "Changed timezone to Asia/Karachi", dateTime: "2024-05-19 10:20" },
  { id: "5", user: "Usman", action: "Deleted Coupon", module: "Marketing", details: "Deleted coupon 'SAVE10'", dateTime: "2024-05-18 09:05" },
];

export type Settings = {
  general: {
    businessName: string;
    timezone: string;
    currency: string;
    defaultLanguage: string;
  };
  notifications: {
    emailNotifications: boolean;
    leadNotifications: boolean;
    reviewNotifications: boolean;
    systemNotifications: boolean;
  };
  email: {
    businessEmail: string;
    senderName: string;
    replyTo: string;
  };
  whatsapp: {
    whatsappNumber: string;
    autoReply: boolean;
    messageTemplate: string;
  };
  analytics: {
    analyticsConfig: string;
    enableGoogleAnalytics: boolean;
    trackingId: string;
  };
  seo: {
    globalSeoTitle: string;
    globalMetaDescription: string;
    enableSitemap: boolean;
  };
  integrations: {
    googleMapsApiKey: string;
    enableFacebookPixel: boolean;
    enableGoogleAds: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: string;
    ipWhitelist: string;
  };
};

export const defaultSettings: Settings = {
  general: {
    businessName: "Acme Inc.",
    timezone: "Asia/Karachi",
    currency: "PKR",
    defaultLanguage: "English",
  },
  notifications: {
    emailNotifications: true,
    leadNotifications: true,
    reviewNotifications: true,
    systemNotifications: false,
  },
  email: {
    businessEmail: "info@acme.com",
    senderName: "Acme Inc.",
    replyTo: "support@acme.com",
  },
  whatsapp: {
    whatsappNumber: "+92 300 1234567",
    autoReply: true,
    messageTemplate: "Thank you for contacting us!",
  },
  analytics: {
    analyticsConfig: "Google Analytics",
    enableGoogleAnalytics: true,
    trackingId: "UA-1234567-1",
  },
  seo: {
    globalSeoTitle: "Acme Inc. - Digital Marketing Agency",
    globalMetaDescription: "Professional digital marketing services",
    enableSitemap: true,
  },
  integrations: {
    googleMapsApiKey: "",
    enableFacebookPixel: false,
    enableGoogleAds: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: "30 minutes",
    ipWhitelist: "",
  },
};