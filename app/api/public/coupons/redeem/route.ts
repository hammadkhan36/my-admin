import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSubscriptionUsable } from "@/lib/subscription/server";
import { logActivity } from "@/lib/activity-log";
import { fail, readJsonObject, reply } from "@/lib/website/request";

export const runtime = "nodejs";

const redeemSchema = z.object({
  code: z.string().trim().min(1).max(64),
});

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

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

  const parsed = redeemSchema.safeParse({ code: parsedBody.body.code });

  if (!parsed.success) return fail("Coupon code is required.", 400);

  try {
    // One atomic UPDATE checks active, dates and usage limit, then counts the use.
    const { data, error } = await createAdminClient().rpc("redeem_coupon", {
      p_code: normalizeCode(parsed.data.code),
    });

    if (error) throw error;

    const redeemed = Array.isArray(data) ? data[0] : null;

    if (!redeemed) return fail("Coupon could not be applied.", 400);

    await logActivity({
      eventType: "coupon.redeemed",
      targetType: "coupon",
      targetId: redeemed.coupon_id,
      details: {
        code: redeemed.coupon_code,
        used_count: redeemed.new_used_count,
      },
    });

    return reply({ success: true, message: "Coupon redeemed successfully." });
  } catch {
    console.error("[website-coupons] Redeem failed.");
    return fail("Coupon could not be applied.", 500);
  }
}
