export type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastActive: string;
};

export const staff: Staff[] = [
  { id: "1", name: "Ahmed Hassan", email: "ahmed@acme.com", role: "Admin", status: "Active", lastActive: "2h ago" },
  { id: "2", name: "Sara Khan", email: "sara@acme.com", role: "Manager", status: "Active", lastActive: "1d ago" },
  { id: "3", name: "Ali Raza", email: "ali@acme.com", role: "Staff", status: "Active", lastActive: "3d ago" },
  { id: "4", name: "Ayesha Malik", email: "ayesha@acme.com", role: "Content Manager", status: "Inactive", lastActive: "1w ago" },
  { id: "5", name: "Usman Tariq", email: "usman@acme.com", role: "Staff", status: "Active", lastActive: "5h ago" },
];

export type Role = {
  name: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
};

export const roles: Role[] = [
  {
    name: "Owner",
    description: "Full access to all features",
    permissions: {
      Dashboard: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Leads: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Customers: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Campaigns: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Offers: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Coupons: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Reviews: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Services: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Products: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Pages: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Media: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      SEO: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Analytics: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Staff: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Settings: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
    },
  },
  {
    name: "Admin",
    description: "Manage most of the system",
    permissions: {
      Dashboard: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Leads: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Customers: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Campaigns: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Offers: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Coupons: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Reviews: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Services: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Products: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      Pages: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Media: { View: true, Create: true, Edit: true, Delete: true, Publish: true, Export: true },
      SEO: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Analytics: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: true },
      Staff: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: false },
      Settings: { View: true, Create: false, Edit: true, Delete: false, Publish: false, Export: false },
    },
  },
  {
    name: "Manager",
    description: "Manage leads, customers, and content",
    permissions: {
      Dashboard: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: true },
      Leads: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: true },
      Customers: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: true },
      Campaigns: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Offers: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Coupons: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Reviews: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: true },
      Services: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Products: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Pages: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Media: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: false },
      SEO: { View: true, Create: false, Edit: true, Delete: false, Publish: false, Export: true },
      Analytics: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: true },
      Staff: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Settings: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
    },
  },
  {
    name: "Staff",
    description: "Basic access to assigned tasks",
    permissions: {
      Dashboard: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Leads: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: false },
      Customers: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: false },
      Campaigns: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Offers: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Coupons: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Reviews: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Services: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Products: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Pages: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Media: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: false },
      SEO: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Analytics: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Staff: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Settings: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
    },
  },
  {
    name: "Content Manager",
    description: "Manage content and media",
    permissions: {
      Dashboard: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Leads: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Customers: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Campaigns: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Offers: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Coupons: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Reviews: { View: true, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Services: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Products: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Pages: { View: true, Create: true, Edit: true, Delete: false, Publish: true, Export: true },
      Media: { View: true, Create: true, Edit: true, Delete: false, Publish: false, Export: false },
      SEO: { View: true, Create: false, Edit: true, Delete: false, Publish: false, Export: true },
      Analytics: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Staff: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
      Settings: { View: false, Create: false, Edit: false, Delete: false, Publish: false, Export: false },
    },
  },
];

export const permissionCategories = [
  "Dashboard",
  "Leads",
  "Customers",
  "Campaigns",
  "Offers",
  "Coupons",
  "Reviews",
  "Services",
  "Products",
  "Pages",
  "Media",
  "SEO",
  "Analytics",
  "Staff",
  "Settings",
];

export const permissionActions = ["View", "Create", "Edit", "Delete", "Publish", "Export"];