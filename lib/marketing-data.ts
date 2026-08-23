export type Campaign = {
  id: string;
  name: string;
  subject: string;
  audience: string;
  message: string;
  schedule: string;
  status: "Draft" | "Scheduled" | "Sent" | "Paused";
  createdAt: string;
};

export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Announcement",
    subject: "🔥 Get 20% off this summer!",
    audience: "All Customers",
    message: "Get ready for our biggest summer sale...",
    schedule: "2024-06-01 10:00 AM",
    status: "Scheduled",
    createdAt: "2024-05-20",
  },
  // ... aur campaigns
];

export type Offer = {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  cta: string;
  startDate: string;
  endDate: string;
  targetPage: string;
  status: "Active" | "Draft" | "Expired";
};

export const offers: Offer[] = [
  {
    id: "1",
    title: "50% Off Web Design",
    description: "Get half off on all website design packages",
    image: "/offers/web-design.jpg",
    discount: "50%",
    cta: "Claim Offer",
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    targetPage: "/services/web-design",
    status: "Active",
  },
  // ...
];

export type Coupon = {
  id: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  uses: number;
  usageLimit: number;
  expiry: string;
  status: "Active" | "Expired";
};

export const coupons: Coupon[] = [
  {
    id: "1",
    code: "SAVE20",
    discountType: "Percentage",
    discountValue: 20,
    uses: 245,
    usageLimit: 1000,
    expiry: "2024-12-31",
    status: "Active",
  },
  // ...
];

export type Referral = {
  id: string;
  customer: string;
  referralCode: string;
  clicks: number;
  leads: number;
  conversions: number;
  rewards: number;
  status: "Active" | "Paused";
};

export const referrals: Referral[] = [
  {
    id: "1",
    customer: "Ali Raza",
    referralCode: "ALI123",
    clicks: 120,
    leads: 45,
    conversions: 20,
    rewards: 500,
    status: "Active",
  },
  // ...
];