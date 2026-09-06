import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";

const eventSchema = z.object({
  event_type: z.enum([
    "page_view",
    "call_click",
    "whatsapp_click",
    "map_click",
    "booking_click",
    "lead_submit",
    "appointment_submit",
    "coupon_validate",
    "coupon_redeem",
    "review_submit",
    "form_submit",
  ]),
  path: z.string().trim().min(1).max(500),
  label: z.string().trim().min(1).max(200).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  visitor_id: z.string().trim().min(1).max(100).nullable().optional(),
  session_id: z.string().trim().min(1).max(100).nullable().optional(),
  referrer_domain: z.string().trim().min(1).max(255).nullable().optional(),
});

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (
    !process.env.WEBSITE_ANALYTICS_API_KEY ||
    apiKey !== process.env.WEBSITE_ANALYTICS_API_KEY
  ) {
    return fail("Unauthorized request.", 401);
  }

  const json: unknown = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(json);

  if (!parsed.success) {
    return fail("Invalid analytics event.", 400);
  }

  const { error } = await createAdminClient().from("website_events").insert({
    event_type: parsed.data.event_type,
    path: parsed.data.path,
    label: parsed.data.label ?? null,
    metadata: parsed.data.metadata ?? {},
    visitor_id: parsed.data.visitor_id ?? null,
    session_id: parsed.data.session_id ?? null,
    referrer_domain: parsed.data.referrer_domain ?? null,
  });

  if (error) {
    return fail(error.message, 500);
  }

  return NextResponse.json({ success: true });
}
    


