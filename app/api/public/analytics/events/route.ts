import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";

const eventSchema = z.object({
  event_type: z.enum([
    "page_view",
    "session_start",
    "session_end",
    "engagement_ping",

    "call_click",
    "whatsapp_click",
    "map_click",
    "booking_click",
    "website_click",
    "social_click",
    "share_click",
    "copy_phone_click",

    "lead_form_start",
    "lead_submit",
    "lead_form_error",
    "lead_form_abandon",

    "appointment_form_start",
    "appointment_submit",
    "appointment_form_error",
    "appointment_form_abandon",

    "custom_form_start",
    "form_submit",
    "custom_form_error",
    "custom_form_abandon",

    "coupon_validate",
    "coupon_redeem",
    "offer_view",
    "offer_click",

    "service_view",
    "service_click",

    "review_form_start",
    "review_submit",
    "review_form_error",
  ]),

  path: z.string().trim().min(1).max(500),
  label: z.string().trim().min(1).max(200).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),

  business_id: z.string().uuid().nullable().optional(),

  visitor_id: z.string().trim().min(1).max(100).nullable().optional(),
  session_id: z.string().trim().min(1).max(100).nullable().optional(),

  page_title: z.string().trim().max(300).nullable().optional(),
  hostname: z.string().trim().max(255).nullable().optional(),
  referrer_url: z.string().trim().max(1000).nullable().optional(),
  referrer_domain: z.string().trim().max(255).nullable().optional(),

  utm_source: z.string().trim().max(255).nullable().optional(),
  utm_medium: z.string().trim().max(255).nullable().optional(),
  utm_campaign: z.string().trim().max(255).nullable().optional(),
  utm_term: z.string().trim().max(255).nullable().optional(),
  utm_content: z.string().trim().max(255).nullable().optional(),

  device_type: z.string().trim().max(50).nullable().optional(),
  browser: z.string().trim().max(100).nullable().optional(),
  os: z.string().trim().max(100).nullable().optional(),

  screen_width: z.number().int().positive().nullable().optional(),
  screen_height: z.number().int().positive().nullable().optional(),
  viewport_width: z.number().int().positive().nullable().optional(),
  viewport_height: z.number().int().positive().nullable().optional(),

  language: z.string().trim().max(50).nullable().optional(),
  timezone: z.string().trim().max(100).nullable().optional(),
  engagement_ms: z.number().int().nonnegative().nullable().optional(),

  service_id: z.string().uuid().nullable().optional(),
  service_name: z.string().trim().max(255).nullable().optional(),

  offer_id: z.string().uuid().nullable().optional(),
  offer_title: z.string().trim().max(255).nullable().optional(),

  form_id: z.string().uuid().nullable().optional(),
  form_name: z.string().trim().max(255).nullable().optional(),

  coupon_code: z.string().trim().max(100).nullable().optional(),

  consent_status: z.enum(["accepted", "rejected", "unknown"]).optional(),
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

    business_id: parsed.data.business_id ?? null,

    visitor_id: parsed.data.visitor_id ?? null,
    session_id: parsed.data.session_id ?? null,

    page_title: parsed.data.page_title ?? null,
    hostname: parsed.data.hostname ?? null,
    referrer_url: parsed.data.referrer_url ?? null,
    referrer_domain: parsed.data.referrer_domain ?? null,

    utm_source: parsed.data.utm_source ?? null,
    utm_medium: parsed.data.utm_medium ?? null,
    utm_campaign: parsed.data.utm_campaign ?? null,
    utm_term: parsed.data.utm_term ?? null,
    utm_content: parsed.data.utm_content ?? null,

    device_type: parsed.data.device_type ?? null,
    browser: parsed.data.browser ?? null,
    os: parsed.data.os ?? null,

    screen_width: parsed.data.screen_width ?? null,
    screen_height: parsed.data.screen_height ?? null,
    viewport_width: parsed.data.viewport_width ?? null,
    viewport_height: parsed.data.viewport_height ?? null,

    language: parsed.data.language ?? null,
    timezone: parsed.data.timezone ?? null,
    engagement_ms: parsed.data.engagement_ms ?? null,

    service_id: parsed.data.service_id ?? null,
    service_name: parsed.data.service_name ?? null,

    offer_id: parsed.data.offer_id ?? null,
    offer_title: parsed.data.offer_title ?? null,

    form_id: parsed.data.form_id ?? null,
    form_name: parsed.data.form_name ?? null,

    coupon_code: parsed.data.coupon_code ?? null,
    consent_status: parsed.data.consent_status ?? "unknown",
  });

  if (error) {
    return fail(error.message, 500);
  }

  return NextResponse.json({ success: true });
}