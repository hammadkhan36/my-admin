export type Review = {
  id: string;
  customer: string;
  rating: number;
  feedback: string;
  source: string;
  date: string;
  status: "Published" | "Pending" | "Flagged";
  response?: string;
  flagStatus?: boolean;
};

export const reviews: Review[] = [
  {
    id: "1",
    customer: "Ali Raza",
    rating: 5,
    feedback: "Excellent service! Web design exceeded expectations.",
    source: "Google",
    date: "2024-05-20",
    status: "Published",
    response: "Thank you Ali! We appreciate your feedback.",
    flagStatus: false,
  },
  {
    id: "2",
    customer: "Sana Khan",
    rating: 4,
    feedback: "Very professional team, quick delivery.",
    source: "Google",
    date: "2024-05-18",
    status: "Published",
    flagStatus: false,
  },
  // ... aur reviews
];

export type Testimonial = {
  id: string;
  customer: string;
  rating: number;
  text: string;
  service: string;
  image: string;
  status: "Published" | "Draft";
};

export const testimonials: Testimonial[] = [
  {
    id: "1",
    customer: "Ahmed Hassan",
    rating: 5,
    text: "Their SEO service boosted our traffic by 200%!",
    service: "SEO Optimization",
    image: "/avatars/ahmed.jpg",
    status: "Published",
  },
  // ...
];

export type GalleryItem = {
  id: string;
  image: string;
  customer: string;
  service: string;
  date: string;
  status: "Pending Review" | "Published" | "Before & After" | "Customer Uploads";
};

export const galleryItems: GalleryItem[] = [
  {
    id: "1",
    image: "/gallery/1.jpg",
    customer: "Ali Raza",
    service: "Web Design",
    date: "2024-05-15",
    status: "Published",
  },
  // ...
];