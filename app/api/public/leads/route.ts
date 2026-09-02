import { NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

const websiteLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().optional().or(z.literal("")),
  service: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  page_url: z.string().trim().max(500).optional().or(z.literal("")),
  referrer: z.string().trim().max(500).optional().or(z.literal("")),
  utm_source: z.string().trim().max(120).optional().or(z.literal("")),
  utm_medium: z.string().trim().max(120).optional().or(z.literal("")),
  utm_campaign: z.string().trim().max(160).optional().or(z.literal("")),
  website_key: z.string().trim().optional(),
});

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function optionalText(value?: string) {
  const text = value?.trim();
  return text ? text : null;
}

async function getOrCreateCustomer({
  name,
  phone,
  email,
}: {
  name: string;
  phone: string;
  email?: string;
}) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    await admin
      .from("customers")
      .update({
        name,
        email: optionalText(email),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return existing.id as string;
  }

  const { data, error } = await admin
    .from("customers")
    .insert({
      name,
      phone,
      email: optionalText(email),
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: null,
    eventType: "customer.created",
    targetType: "customer",
    targetId: data.id,
    details: {
      name,
      phone,
      source: "website_lead",
    },
  });

  return data.id as string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = websiteLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead data.",
        },
        { status: 400 }
      );
    }

    const expectedKey = process.env.WEBSITE_LEAD_API_KEY;

    if (expectedKey && result.data.website_key !== expectedKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const phone = normalizePhone(result.data.phone);

    const customerId = await getOrCreateCustomer({
      name: result.data.name,
      phone,
      email: result.data.email || undefined,
    });

    const admin = createAdminClient();

    const { data: lead, error } = await admin
      .from("leads")
      .insert({
        customer_id: customerId,
        name: result.data.name,
        phone,
        email: optionalText(result.data.email),
        service: optionalText(result.data.service),
        message: optionalText(result.data.message),
        source: "website",
        status: "new",
        priority: "normal",
        page_url: optionalText(result.data.page_url),
        referrer: optionalText(result.data.referrer),
        utm_source: optionalText(result.data.utm_source),
        utm_medium: optionalText(result.data.utm_medium),
        utm_campaign: optionalText(result.data.utm_campaign),
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    await admin.from("lead_status_history").insert({
      lead_id: lead.id,
      old_status: null,
      new_status: "new",
    });

    await logActivity({
      actorId: null,
      eventType: "lead.created",
      targetType: "lead",
      targetId: lead.id,
      details: {
        name: result.data.name,
        phone,
        customer_id: customerId,
        source: "website",
        page_url: optionalText(result.data.page_url),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully.",
      lead_id: lead.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Lead could not be submitted.",
      },
      { status: 500 }
    );
  }
}