export type DateRange = "7d" | "30d" | "90d" | "custom";

export const websiteAnalytics = {
  visitors: 45820,
  sessions: 62100,
  pageViews: 98230,
  avgSessionDuration: "2m 45s",
};

export const leadAnalytics = {
  leads: 847,
  conversionRate: 15.2,
  quoteRequests: 312,
  whatsappClicks: 1102,
  callClicks: 689,
};

export const marketingAnalytics = {
  campaigns: 24,
  coupons: 12,
  referrals: 156,
  trafficSources: 8,
};

// Traffic sources data
export const trafficSources = [
  { source: "Google Organic", visitors: 12400, leads: 480, customers: 180, conversionRate: 14.5, revenue: 18500 },
  { source: "Google Business Profile", visitors: 9800, leads: 220, customers: 95, conversionRate: 9.7, revenue: 9200 },
  { source: "Facebook", visitors: 7600, leads: 310, customers: 120, conversionRate: 15.8, revenue: 11300 },
  { source: "Instagram", visitors: 5400, leads: 180, customers: 65, conversionRate: 12.0, revenue: 6100 },
  { source: "Direct", visitors: 3200, leads: 90, customers: 40, conversionRate: 12.5, revenue: 4200 },
  { source: "Referral", visitors: 2100, leads: 55, customers: 22, conversionRate: 10.5, revenue: 2300 },
  { source: "Other", visitors: 900, leads: 20, customers: 8, conversionRate: 8.9, revenue: 900 },
];

// Top pages
export const topPages = [
  { page: "/", views: 12500, visitors: 8900 },
  { page: "/services/web-design", views: 6200, visitors: 4300 },
  { page: "/contact", views: 4100, visitors: 2800 },
  { page: "/about", views: 3400, visitors: 2100 },
  { page: "/products", views: 2900, visitors: 1800 },
];

// Landing pages
export const landingPages = [
  { page: "/web-design", leads: 120, conversionRate: 18.5 },
  { page: "/seo", leads: 85, conversionRate: 14.2 },
  { page: "/social-media", leads: 65, conversionRate: 12.8 },
  { page: "/branding", leads: 40, conversionRate: 9.5 },
];

// Reports data
export type Report = {
  id: string;
  type: "Weekly" | "Monthly";
  period: string;
  leads: number;
  newCustomers: number;
  whatsappClicks: number;
  callClicks: number;
  googleReviews: number;
  conversionRate: number;
  topService: string;
  topSource: string;
};

export const reports: Report[] = [
  {
    id: "1",
    type: "Weekly",
    period: "May 12 - May 18, 2024",
    leads: 156,
    newCustomers: 42,
    whatsappClicks: 280,
    callClicks: 130,
    googleReviews: 12,
    conversionRate: 14.8,
    topService: "Web Design",
    topSource: "Google Organic",
  },
  {
    id: "2",
    type: "Weekly",
    period: "May 5 - May 11, 2024",
    leads: 142,
    newCustomers: 38,
    whatsappClicks: 245,
    callClicks: 118,
    googleReviews: 9,
    conversionRate: 13.9,
    topService: "SEO Optimization",
    topSource: "Facebook",
  },
  {
    id: "3",
    type: "Monthly",
    period: "April 2024",
    leads: 620,
    newCustomers: 180,
    whatsappClicks: 980,
    callClicks: 450,
    googleReviews: 35,
    conversionRate: 15.2,
    topService: "Web Design",
    topSource: "Google Business Profile",
  },
  {
    id: "4",
    type: "Monthly",
    period: "March 2024",
    leads: 540,
    newCustomers: 150,
    whatsappClicks: 810,
    callClicks: 390,
    googleReviews: 28,
    conversionRate: 14.1,
    topService: "Social Media",
    topSource: "Google Organic",
  },
];