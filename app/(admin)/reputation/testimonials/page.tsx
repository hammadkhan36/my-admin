




import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import {
  TestimonialsManager,
  type TestimonialRow,
} from "@/components/reputation/testimonials-manager";

export default async function TestimonialsPage() {
  await requirePermission("testimonials.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select(
      "id, customer_name, customer_role, quote, rating, image_url, is_active, sort_order, created_at"
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <TestimonialsManager testimonials={(data ?? []) as TestimonialRow[]} />
  );
}