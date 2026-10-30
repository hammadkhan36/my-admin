import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSubscriptionUsable } from "@/lib/subscription/server";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity-log";
import { consumeContactQuota } from "@/lib/website/submissions";
import { fail, readJsonObject, reply, safePageUrl } from "@/lib/website/request";

export const runtime = "nodejs";

const MAX_VALUE_LENGTH = 2000;
const MAX_FIELDS = 50;

const submitSchema = z.object({
  form_slug: z.string().trim().min(1).max(100),
  data: z.record(z.string(), z.unknown()),
  page_url: z.string().trim().max(2048).optional().default(""),
  referrer: z.string().trim().max(2048).optional().default(""),
});

type FormField = {
  label: string;
  name: string;
  type: string;
  required: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export async function POST(request: NextRequest) {
  const expectedKey = process.env.WEBSITE_CONFIG_API_KEY;

  if (!expectedKey) {
    return fail("Form service is unavailable.", 503);
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

  const parsed = submitSchema.safeParse({
    form_slug: body.form_slug ?? body.slug,
    data: body.data ?? {},
    page_url: body.page_url ?? "",
    referrer: body.referrer ?? "",
  });

  if (!parsed.success) return fail("Please check the form details.", 400);

  const input = parsed.data;

  try {
    const supabase = createAdminClient();

    const { data: form, error: formError } = await supabase
      .from("custom_forms")
      .select("id, name, slug, fields, is_active")
      .eq("slug", input.form_slug)
      .maybeSingle();

    if (formError) throw new Error("FORM_LOOKUP_FAILED");
    if (!form || !form.is_active) return fail("Form is not available.", 400);

    const fields = (Array.isArray(form.fields) ? form.fields : [])
      .slice(0, MAX_FIELDS) as FormField[];

    // Store only the fields the form defines; anything else is dropped.
    const data: Record<string, string> = {};

    for (const field of fields) {
      if (!field || typeof field.name !== "string") continue;

      const value = fieldText(input.data[field.name]);

      if (value.length > MAX_VALUE_LENGTH) {
        return fail(`${field.label || field.name} is too long.`, 400);
      }

      if (field.required && !value) {
        return fail(`${field.label || field.name} is required.`, 400);
      }

      if (value && field.type === "email" && !EMAIL_PATTERN.test(value)) {
        return fail(`${field.label || field.name} must be a valid email address.`, 400);
      }

      if (value) data[field.name] = value;
    }

    const customerName =
      (data.full_name || data.name || data.customer_name || "").slice(0, 100) || null;
    const customerPhone =
      (data.phone || data.customer_phone || "").slice(0, 30) || null;
    const customerEmail =
      (data.email || data.customer_email || "").slice(0, 254) || null;

    if (customerPhone || customerEmail) {
      await consumeContactQuota("forms", expectedKey, customerPhone || "", customerEmail);
    }

    const { data: submission, error } = await supabase
      .from("form_submissions")
      .insert({
        form_id: form.id,
        form_slug: form.slug,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        data,
        page_url: safePageUrl(input.page_url),
        referrer: safePageUrl(input.referrer),
      })
      .select("id")
      .single();

    if (error || !submission) throw new Error("INSERT_FAILED");

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

    return reply({
      success: true,
      submission_id: submission.id,
      message: "Form submitted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
      return fail("Too many requests. Please try again later.", 429);
    }

    if (error instanceof Error && error.message === "QUOTA_UNAVAILABLE") {
      return fail("Submission service temporarily unavailable.", 503);
    }

    console.error("[website-forms] Submission was not confirmed.");
    return fail("We could not confirm your submission. Please try again later.", 500);
  }
}
