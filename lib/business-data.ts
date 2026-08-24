export type BusinessProfile = {
  name: string;
  logo: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  address: string;
  googleMapsUrl: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
  media: {
    logo: string;
    coverImage: string;
    businessImages: string[];
  };
};

export const businessProfile: BusinessProfile = {
  name: "Acme Inc.",
  logo: "/logo.svg",
  description: "We provide top-notch web design and digital marketing services.",
  phone: "+92 300 1234567",
  email: "info@acme.com",
  whatsapp: "+92 300 1234567",
  website: "https://acme.com",
  address: "123 Main Street, Islamabad, Pakistan",
  googleMapsUrl: "https://maps.google.com/?q=Acme+Inc+Islamabad",
  social: {
    facebook: "https://facebook.com/acme",
    instagram: "https://instagram.com/acme",
    tiktok: "https://tiktok.com/@acme",
    youtube: "https://youtube.com/acme",
  },
  media: {
    logo: "/logo.svg",
    coverImage: "/covers/cover.jpg",
    businessImages: ["/business/1.jpg", "/business/2.jpg", "/business/3.jpg"],
  },
};

export type ServiceArea = {
  id: string;
  areaName: string;
  serviceAvailability: "Full" | "Partial" | "Not Available";
  status: "Active" | "Inactive";
};

export const serviceAreas: ServiceArea[] = [
  { id: "1", areaName: "Attock", serviceAvailability: "Full", status: "Active" },
  { id: "2", areaName: "Hazro", serviceAvailability: "Partial", status: "Active" },
  { id: "3", areaName: "Kamra", serviceAvailability: "Full", status: "Active" },
  { id: "4", areaName: "Taxila", serviceAvailability: "Full", status: "Active" },
  { id: "5", areaName: "Rawalpindi", serviceAvailability: "Full", status: "Active" },
  { id: "6", areaName: "Islamabad", serviceAvailability: "Full", status: "Active" },
];

export type BusinessDay = {
  day: string;
  open: boolean;
  openingTime: string;
  closingTime: string;
};

export const businessHours: BusinessDay[] = [
  { day: "Monday", open: true, openingTime: "09:00", closingTime: "18:00" },
  { day: "Tuesday", open: true, openingTime: "09:00", closingTime: "18:00" },
  { day: "Wednesday", open: true, openingTime: "09:00", closingTime: "18:00" },
  { day: "Thursday", open: true, openingTime: "09:00", closingTime: "18:00" },
  { day: "Friday", open: true, openingTime: "09:00", closingTime: "18:00" },
  { day: "Saturday", open: true, openingTime: "10:00", closingTime: "16:00" },
  { day: "Sunday", open: false, openingTime: "10:00", closingTime: "14:00" },
];

export type SpecialHours = {
  date: string;
  description: string;
  open: boolean;
  openingTime?: string;
  closingTime?: string;
};

export const specialHours: SpecialHours[] = [
  { date: "2024-12-25", description: "Christmas", open: false },
  { date: "2024-11-09", description: "Iqbal Day", open: true, openingTime: "10:00", closingTime: "14:00" },
];