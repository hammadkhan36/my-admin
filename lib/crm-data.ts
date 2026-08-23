export type Lead = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  whatsapp?: string;
  service: string;
  source: string;
  landingPage?: string;
  campaign?: string;
  status: "New" | "Contacted" | "Qualified" | "Won" | "Lost";
  tags: string[];
  notes?: string;
  assignedStaff: string;
  createdAt: string;
  activity: { text: string; time: string }[];
};

export const leads: Lead[] = [
  {
    id: "1",
    customer: "Ali Raza",
    email: "ali@example.com",
    phone: "+92 300 1234567",
    whatsapp: "+92 300 1234567",
    service: "Web Design",
    source: "Google Ads",
    landingPage: "/web-design",
    campaign: "Summer Sale",
    status: "New",
    tags: ["Hot", "Follow-up"],
    assignedStaff: "Ahmed",
    createdAt: "2024-01-15",
    activity: [
      { text: "Lead created", time: "2h ago" },
      { text: "Email sent", time: "1h ago" },
    ],
  },
  // ... aur leads
];

export const customers = [
  {
    id: "1",
    name: "Sana Khan",
    email: "sana@example.com",
    phone: "+92 321 9876543",
    tags: ["VIP", "Regular"],
    lastActivity: "2d ago",
    status: "Active",
    notes: "Prefers WhatsApp",
    leadHistory: [{ service: "SEO", date: "2023-11-01", status: "Won" }],
    couponHistory: [{ code: "SAVE20", date: "2024-01-10" }],
    reviewHistory: [{ rating: 5, date: "2024-02-01" }],
  },
  // ...
];

export const notifications = [
  {
    id: "1",
    category: "Leads",
    title: "New lead received",
    description: "Ali Raza submitted a query for Web Design",
    time: "2h ago",
    read: false,
  },
  // ...
];