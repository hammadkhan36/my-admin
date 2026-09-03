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

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!process.env.WEBSITE_CONFIG_API_KEY || apiKey !== process.env.WEBSITE_CONFIG_API_KEY) {
    return fail("Unauthorized request.", 401);
  }

  const body = await request.json();
  const code = normalizeCode(String(body.code || ""));

  if (!code) return fail("Coupon code is required.");

  const supabase = createAdminClient();
  const today = todayDate();

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select(
      "id, code, title, description, discount_type, discount_value, starts_at, ends_at, usage_limit, used_count, is_active"
    )
    .eq("code", code)
    .maybeSingle();

  if (error) return fail(error.message, 500);
  if (!coupon) return fail("Coupon code is not valid.");
  if (!coupon.is_active) return fail("Coupon code is not active.");

  if (coupon.starts_at && coupon.starts_at > today) {
    return fail("Coupon is not active yet.");
  }

  if (coupon.ends_at && coupon.ends_at < today) {
    return fail("Coupon has expired.");
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return fail("Coupon usage limit reached.");
  }

  return ok({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
    },
    message: "Coupon is valid.",
  });
}
