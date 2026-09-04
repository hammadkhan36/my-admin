import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("testimonials");
  await requirePermission("testimonials.view");

  return children;
}