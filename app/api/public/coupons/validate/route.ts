import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSubscriptionUsable } from "@/lib/subscription/server";
import { businessNow } from "@/lib/appointments/schedule";
import { fail, readJsonObject, reply } from "@/lib/website/request";

export const runtime = "nodejs";

const validateSchema = z.object({
  code: z.string().trim().min(1).max(64),
});

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

// One answer for every failure (unknown, inactive, not started, expired, used up),
// so a script cannot tell which codes exist.
const NOT_VALID = "Coupon code is not valid.";

export async function POST(request: NextRequest) {
  const expectedKey = process.env.WEBSITE_CONFIG_API_KEY;

  if (!expectedKey) {
    return fail("Coupon service is unavailable.", 503);
  }

  if (request.headers.get("x-api-key") !== expectedKey) {
    return fail("Unauthorized request.", 401);
  }

  if (!(await isSubscriptionUsable())) {
    return fail("Service is unavailable.", 503);
  }

  const parsedBody = await readJsonObject(request);

  if ("response" in parsedBody) return parsedBody.response;

  const parsed = validateSchema.safeParse({ code: parsedBody.body.code });

  if (!parsed.success) return fail("Coupon code is required.", 400);

  try {
    const supabase = createAdminClient();

    const [couponResult, settingsResult] = await Promise.all([
      supabase
        .from("coupons")
        .select(
          "id, code, title, description, discount_type, discount_value, starts_at, ends_at, usage_limit, used_count, is_active"
        )
        .eq("code", normalizeCode(parsed.data.code))
        .maybeSingle(),
      supabase.from("business_settings").select("timezone").limit(1).maybeSingle(),
    ]);

    if (couponResult.error || settingsResult.error) throw new Error("LOOKUP_FAILED");

    const coupon = couponResult.data;
    const today = businessNow(settingsResult.data?.timezone || "UTC").date;

    if (
      !coupon ||
      !coupon.is_active ||
      (coupon.starts_at && coupon.starts_at > today) ||
      (coupon.ends_at && coupon.ends_at < today) ||
      (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit)
    ) {
      return fail(NOT_VALID, 400);
    }

    return reply({
      success: true,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      message: "Coupon is valid.",
    });
  } catch {
    console.error("[website-coupons] Validate failed.");
    return fail("Coupon could not be checked. Please try again.", 500);
  }
}
