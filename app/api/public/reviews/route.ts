import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSubscriptionUsable } from "@/lib/subscription/server";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity-log";
import { consumeContactQuota } from "@/lib/website/submissions";
import { fail, readJsonObject, reply } from "@/lib/website/request";

export const runtime = "nodejs";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");

const reviewSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: optionalText(30)
    .transform((value) => value.replace(/[\s().-]/g, ""))
    .refine((value) => !value || /^\+?\d{7,15}$/.test(value)),
  customer_email: optionalText(254).refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ),
  rating: z.coerce.number().int().min(1).max(5),
  title: optionalText(150),
  comment: z.string().trim().min(5).max(2000),
});

export async function POST(request: NextRequest) {
  const expectedKey = process.env.WEBSITE_CONFIG_API_KEY;

  if (!expectedKey) {
    return fail("Review service is unavailable.", 503);
  }

  if (request.headers.get("x-api-key") !== expectedKey) {
    return fail("Unauthorized request.", 401);
  }

  if (!(await isSubscriptionUsable())) {
    return fail("Service is unavailable.", 503);
  }

  const parsedBody = await readJsonObject(request);

  if ("response" in parsedBody) return parsedBody.response;

  const body = parsedBody.body;

  // Preserve field aliases supported by the existing API.
  const parsed = reviewSchema.safeParse({
    customer_name: body.customer_name ?? body.name,
    customer_phone: body.customer_phone ?? body.phone ?? "",
    customer_email: body.customer_email ?? body.email ?? "",
    rating: body.rating,
    title: body.title ?? "",
    comment: body.comment ?? body.message,
  });

  if (!parsed.success) {
    return fail("Please check your name, rating and review.", 400);
  }

  const input = parsed.data;

  // A contact is needed so the per-contact quota can apply.
  if (!input.customer_phone && !input.customer_email) {
    return fail("Please supply a phone number or email address.", 400);
  }

  try {
    await consumeContactQuota(
      "reviews",
      expectedKey,
      input.customer_phone,
      input.customer_email || null
    );

    // Public reviews are never linked to, or create, a customer record.
    const { data, error } = await createAdminClient()
      .from("reviews")
      .insert({
        customer_id: null,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone || null,
        customer_email: input.customer_email || null,
        rating: input.rating,
        title: input.title || null,
        comment: input.comment,
        source: "website",
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !data) throw new Error("INSERT_FAILED");

    await logActivity({
      eventType: "review.created",
      targetType: "review",
      targetId: data.id,
      details: {
        customer_name: input.customer_name,
        rating: input.rating,
        source: "website",
      },
    });

    await createNotification({
      title: "New website review",
      message: `${input.customer_name} submitted a review. Approval required.`,
      type: "info",
      targetUrl: "/reputation/reviews",
    });

    return reply({
      success: true,
      message: "Review submitted successfully and is pending approval.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
      return fail("Too many requests. Please try again later.", 429);
    }

    if (error instanceof Error && error.message === "QUOTA_UNAVAILABLE") {
      return fail("Submission service temporarily unavailable.", 503);
    }

    console.error("[website-reviews] Submission was not confirmed.");
    return fail("We could not confirm your review. Please try again later.", 500);
  }
}
