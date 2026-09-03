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

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function getOrCreateCustomer(input: {
  name: string;
  phone: string;
  email: string | null;
}) {
  const supabase = createAdminClient();
  const phone = cleanPhone(input.phone);

  const { data: existing, error: existingError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  if (existing) {
    await supabase
      .from("customers")
      .update({
        name: input.name,
        email: input.email,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      phone,
      email: input.email,
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return data.id as string;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!process.env.WEBSITE_LEAD_API_KEY || apiKey !== process.env.WEBSITE_LEAD_API_KEY) {
    return fail("Unauthorized request.", 401);
  }

  try {
    const body = await request.json();

    const name = asString(body.name || body.customer_name);
    const phone = asString(body.phone || body.customer_phone);
    const email = asString(body.email || body.customer_email) || null;
    const service = asString(body.service) || null;
    const message = asString(body.message || body.note) || null;

    const pageUrl = asString(body.page_url) || null;
    const referrer = asString(body.referrer) || null;
    const utmSource = asString(body.utm_source) || null;
    const utmMedium = asString(body.utm_medium) || null;
    const utmCampaign = asString(body.utm_campaign) || null;

    if (!name) return fail("Name is required.");
    if (!phone) return fail("Phone is required.");

    const supabase = createAdminClient();

    const customerId = await getOrCreateCustomer({
      name,
      phone,
      email,
    });

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        customer_id: customerId,
        name,
        phone: cleanPhone(phone),
        email,
        service,
        message,
        source: "website",
        status: "new",
        page_url: pageUrl,
        referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("lead_status_history").insert({
      lead_id: lead.id,
      old_status: null,
      new_status: "new",
      note: "Website lead submitted",
    });

    await logActivity({
      eventType: "lead.created",
      targetType: "lead",
      targetId: lead.id,
      details: {
        name,
        source: "website",
        page_url: pageUrl,
        utm_source: utmSource,
      },
    });

    await createNotification({
      title: "New website lead",
      message: `${name} submitted a lead from the website.`,
      type: "info",
      targetUrl: `/crm/leads/${lead.id}`,
    });

    return ok({
      lead_id: lead.id,
      customer_id: customerId,
      message: "Lead submitted successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lead request failed.";
    return fail(message, 500);
  }
}



















// Step 3: Website Example Code

// Business website me lead form submit ke liye:

// async function submitLead() {
//   const response = await fetch("https://your-admin-domain.com/api/public/leads", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": process.env.WEBSITE_LEAD_API_KEY!,
//     },
//     body: JSON.stringify({
//       name: "Ali Khan",
//       phone: "+923001234567",
//       email: "ali@example.com",
//       service: "Website Design",
//       message: "I need pricing details.",
//       page_url: window.location.href,
//       referrer: document.referrer,
//       utm_source: "google",
//       utm_medium: "organic",
//       utm_campaign: "homepage"
//     }),
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     alert(result.error || "Lead submit failed.");
//     return;
//   }

//   alert(result.message || "Lead submitted.");
// }

// Production me is ko direct browser se call na karna behtar hai. Website ke apne server route se call karna, taake secret key frontend me expose na ho.