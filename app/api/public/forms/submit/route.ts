import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity-log";

type FormField = {
  label: string;
  name: string;
  type: string;
  required: boolean;
};

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

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!process.env.WEBSITE_CONFIG_API_KEY || apiKey !== process.env.WEBSITE_CONFIG_API_KEY) {
    return fail("Unauthorized request.", 401);
  }

  try {
    const body = await request.json();

    const formSlug = asString(body.form_slug || body.slug);
    const data = (body.data || {}) as Record<string, unknown>;
    const pageUrl = asString(body.page_url) || null;
    const referrer = asString(body.referrer) || null;

    if (!formSlug) return fail("Form slug is required.");

    const supabase = createAdminClient();

    const { data: form, error: formError } = await supabase
      .from("custom_forms")
      .select("id, name, slug, fields, is_active")
      .eq("slug", formSlug)
      .maybeSingle();

    if (formError) return fail(formError.message, 500);
    if (!form || !form.is_active) return fail("Form is not available.");

    const fields = (form.fields || []) as FormField[];

    for (const field of fields) {
      if (field.required && !asString(data[field.name])) {
        return fail(`${field.label} is required.`);
      }
    }

    const customerName =
      asString(data.full_name) ||
      asString(data.name) ||
      asString(data.customer_name) ||
      null;

    const customerPhone =
      asString(data.phone) ||
      asString(data.customer_phone) ||
      null;

    const customerEmail =
      asString(data.email) ||
      asString(data.customer_email) ||
      null;

    const { data: submission, error } = await supabase
      .from("form_submissions")
      .insert({
        form_id: form.id,
        form_slug: form.slug,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        data,
        page_url: pageUrl,
        referrer,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    await logActivity({
      eventType: "form.submitted",
      targetType: "form_submission",
      targetId: submission.id,
      details: {
        form_name: form.name,
        form_slug: form.slug,
        customer_name: customerName,
      },
    });

    await createNotification({
      title: "New form submission",
      message: `${form.name} received a new submission.`,
      type: "info",
      targetUrl: "/website/forms",
    });

    return ok({
      submission_id: submission.id,
      message: "Form submitted successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Form submit failed.";
    return fail(message, 500);
  }
}