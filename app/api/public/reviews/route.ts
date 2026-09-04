import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity-log";

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

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function ratingValue(value: unknown) {
  const rating = Number(value || 5);
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, rating));
}

async function getCustomerId(input: {
  name: string;
  phone: string | null;
  email: string | null;
}) {
  if (!input.phone) return null;

  const supabase = createAdminClient();
  const phone = cleanPhone(input.phone);

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      phone,
      email: input.email,
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  return data?.id as string | null;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!process.env.WEBSITE_CONFIG_API_KEY || apiKey !== process.env.WEBSITE_CONFIG_API_KEY) {
    return fail("Unauthorized request.", 401);
  }

  try {
    const body = await request.json();

    const customerName = asString(body.customer_name || body.name);
    const customerPhone = asString(body.customer_phone || body.phone) || null;
    const customerEmail = asString(body.customer_email || body.email) || null;
    const rating = ratingValue(body.rating);
    const title = asString(body.title) || null;
    const comment = asString(body.comment || body.message);

    if (!customerName) return fail("Customer name is required.");
    if (!comment) return fail("Review comment is required.");

    const supabase = createAdminClient();

    const customerId = await getCustomerId({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    });

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone ? cleanPhone(customerPhone) : null,
        customer_email: customerEmail,
        rating,
        title,
        comment,
        source: "website",
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    await logActivity({
      eventType: "review.created",
      targetType: "review",
      targetId: data.id,
      details: {
        customer_name: customerName,
        rating,
        source: "website",
      },
    });

    await createNotification({
      title: "New website review",
      message: `${customerName} submitted a review. Approval required.`,
      type: "info",
      targetUrl: "/reputation/reviews",
    });

    return ok({
      review_id: data.id,
      message: "Review submitted successfully and is pending approval.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Review submit failed.";

    return fail(message, 500);
  }
}