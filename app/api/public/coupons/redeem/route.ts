import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
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
    .select("id, code, usage_limit, used_count, starts_at, ends_at, is_active")
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

  const { error: updateError } = await supabase
    .from("coupons")
    .update({ used_count: coupon.used_count + 1 })
    .eq("id", coupon.id);

  if (updateError) return fail(updateError.message, 500);

  await logActivity({
    eventType: "coupon.redeemed",
    targetType: "coupon",
    targetId: coupon.id,
    details: {
      code: coupon.code,
      used_count: coupon.used_count + 1,
    },
  });

  return ok({
    coupon_id: coupon.id,
    code: coupon.code,
    used_count: coupon.used_count + 1,
    message: "Coupon redeemed successfully.",
  });
}


















// Step 3: Website Flow

// Website me coupon flow kuch aisa hoga:

// Step	API
// User enters coupon	/api/public/coupons/validate
// Website shows discount	local calculation
// User submits booking/order	/api/public/coupons/redeem
// Dashboard updates used count	used_count + 1

// Important: validate par count increase nahi hota. Sirf redeem par count increase hota hai.

// Step 4: Test

// Postman/Thunder Client:

// POST http://localhost:3000/api/public/coupons/redeem

// Headers:

// Content-Type: application/json
// x-api-key: change-this-config-secret-key

// Body:

// {
//   "code": "WELCOME10"
// }