



import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { ReviewsManager, type ReviewRow } from "@/components/reputation/reviews-manager";

export default async function ReviewsPage() {
  await requirePermission("reviews.view");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, customer_name, customer_phone, customer_email, rating, title, comment, source, status, is_featured, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <ReviewsManager reviews={(data ?? []) as ReviewRow[]} />;
}