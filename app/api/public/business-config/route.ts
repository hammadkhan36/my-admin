import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({
    success: true,
    ...data,
  });
}

function fail(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (
    !process.env.WEBSITE_CONFIG_API_KEY ||
    apiKey !== process.env.WEBSITE_CONFIG_API_KEY
  ) {
    return fail("Unauthorized request.", 401);
  }

  const supabase = createAdminClient();

  const [
    { data: businessSettings, error: businessError },
    { data: services, error: servicesError },
    { data: businessHours, error: hoursError },
    { data: serviceAreas, error: areasError },
    { data: faqs, error: faqsError },
    { data: testimonials, error: testimonialsError },
    { data: mediaItems, error: mediaError },
    { data: offers, error: offersError },
    { data: reviews, error: reviewsError },
  ] = await Promise.all([
    supabase
      .from("business_settings")
      .select(
        `
        business_name,
        short_name,
        logo_url,
        favicon_url,
        theme_color,
        contact_email,
        contact_phone,
        address,
        social_links
      `
      )
      .limit(1)
      .maybeSingle(),

    supabase
      .from("services")
      .select(
        `
        id,
        name,
        description,
        price,
        duration_minutes,
        sort_order
      `
      )
      .eq("is_active", true)
      .eq("show_on_website", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("business_hours")
      .select("day_of_week, day_name, opens_at, closes_at, is_closed, is_24h")
      .order("day_of_week", { ascending: true }),

    supabase
      .from("service_areas")
      .select("id, area_name, city, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("area_name", { ascending: true }),

    supabase
      .from("faqs")
      .select("id, question, answer, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("testimonials")
      .select("id, customer_name, customer_role, quote, rating, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("media_items")
      .select(
        "id, title, description, image_url, alt_text, category, is_featured, sort_order"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("offers")
      .select(
        "id, title, description, discount_label, starts_at, ends_at, cta_label, cta_url, image_url, sort_order"
      )
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString().slice(0, 10)}`)
      .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString().slice(0, 10)}`)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),


    supabase
      .from("reviews")
      .select("id, customer_name, rating, title, comment, source, is_featured, created_at")
      .eq("status", "approved")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),

  ]);


  if (businessError) return fail(businessError.message, 500);
  if (servicesError) return fail(servicesError.message, 500);
  if (hoursError) return fail(hoursError.message, 500);
  if (areasError) return fail(areasError.message, 500);
  if (faqsError) return fail(faqsError.message, 500);
  if (testimonialsError) return fail(testimonialsError.message, 500);
  if (mediaError) return fail(mediaError.message, 500);
  if (offersError) return fail(offersError.message, 500);
  if (reviewsError) return fail(reviewsError.message, 500);

  return ok({
    business: businessSettings,
    services: services ?? [],
    business_hours: businessHours ?? [],
    service_areas: serviceAreas ?? [],
    faqs: faqs ?? [],
    testimonials: testimonials ?? [],
    media: mediaItems ?? [],
    gallery: (mediaItems ?? []).filter((item) => item.category === "gallery"),
    offers: offers ?? [],
    reviews: reviews ?? [],
  });
}