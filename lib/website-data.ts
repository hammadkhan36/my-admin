export type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  status: "Published" | "Draft";
  leads: number;
  featured: boolean;
  image?: string;
  features?: string[];
  faqs?: { q: string; a: string }[];
  seo?: { title: string; metaDescription: string };
};

export const services: Service[] = [
  {
    id: "1",
    name: "Web Design",
    description: "Custom responsive website design",
    price: "$499",
    category: "Design",
    status: "Published",
    leads: 245,
    featured: true,
    image: "/services/web-design.jpg",
    features: ["Responsive", "SEO Ready", "3 Pages"],
  },
  // ...
];

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  featured: boolean;
  available: boolean;
  status: "Published" | "Draft";
  image?: string;
};

export const products: Product[] = [
  {
    id: "1",
    name: "SEO Starter Package",
    description: "Basic SEO optimization",
    price: "$199",
    category: "SEO",
    featured: false,
    available: true,
    status: "Published",
    image: "/products/seo-starter.jpg",
  },
  // ...
];

export type WebPage = {
  id: string;
  name: string;
  status: "Published" | "Draft";
  lastUpdated: string;
  seoStatus: "Good" | "Warning" | "Missing";
  content?: string;
  sections?: string[];
};

export const webPages: WebPage[] = [
  { id: "1", name: "Home", status: "Published", lastUpdated: "2024-05-10", seoStatus: "Good" },
  { id: "2", name: "About", status: "Published", lastUpdated: "2024-04-22", seoStatus: "Good" },
  { id: "3", name: "Services", status: "Published", lastUpdated: "2024-05-01", seoStatus: "Warning" },
  { id: "4", name: "Contact", status: "Published", lastUpdated: "2024-03-15", seoStatus: "Missing" },
  { id: "5", name: "Custom Cakes", status: "Draft", lastUpdated: "2024-05-18", seoStatus: "Missing" },
  // ...
];

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  page: string;
  order: number;
  published: boolean;
};

export const faqs: FAQ[] = [
  { id: "1", question: "How long does web design take?", answer: "Typically 2-4 weeks.", page: "Services", order: 1, published: true },
  // ...
];

export type MediaItem = {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  category: string;
  size: string;
  uploadedAt: string;
};

export const mediaItems: MediaItem[] = [
  { id: "1", url: "/media/image1.jpg", name: "hero-banner.jpg", type: "image", category: "Website", size: "2.4 MB", uploadedAt: "2024-05-20" },
  // ...
];

export type SEOData = {
  overallScore: number;
  pagesOptimized: number;
  missingTitles: number;
  missingMetaDescriptions: number;
  seoIssues: number;
  pages: {
    page: string;
    title: string;
    metaDescription: string;
    indexing: "Indexed" | "Noindex" | "Pending";
    score: number;
  }[];
};

export const seoData: SEOData = {
  overallScore: 86,
  pagesOptimized: 18,
  missingTitles: 3,
  missingMetaDescriptions: 5,
  seoIssues: 8,
  pages: [
    { page: "Home", title: "Best Web Design Services", metaDescription: "Professional web design...", indexing: "Indexed", score: 95 },
    { page: "About", title: "About Us", metaDescription: "Learn about our team...", indexing: "Indexed", score: 88 },
    { page: "Services", title: "", metaDescription: "Our services...", indexing: "Pending", score: 45 },
    // ...
  ],
};