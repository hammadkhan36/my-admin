import { randomUUID } from "node:crypto";
import { consumeContactQuota, findSubmission, saveSubmission, submissionFingerprint } from "@/lib/website/submissions";
import { resolveCustomer, validateContact } from "@/lib/contacts/server";
import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),

  phone: optionalText(30).transform(value => value.replace(/[\s().-]/g, "")).refine(value => !value || /^\+?\d{7,15}$/.test(value)),

  email: optionalText(254).refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ),

  service: optionalText(150),
  message: optionalText(2000),
  page_url: optionalText(2048),
  referrer: optionalText(2048),
  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),
});

type LeadInput = z.infer<typeof leadSchema>;
type AdminClient = ReturnType<typeof createAdminClient>;

function reply(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(error: string, status: number) {
  return reply({ success: false, error }, status);
}

function safePageUrl(value: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (!["https:", "http:"].includes(url.protocol)) {
      return null;
    }

    // Exclude credentials, query parameters and fragments.
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

async function readBody(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error("INVALID_BODY");
  }

  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) break;

      bytes += chunk.value.byteLength;

      if (bytes > 16_000) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }

      text += decoder.decode(chunk.value, { stream: true });
    }

    text += decoder.decode();

    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

async function getOrCreateCustomer(_admin: AdminClient, input: LeadInput): Promise<string> {
  return resolveCustomer(input);
}

async function runFollowUps(
  leadId: string,
  customerId: string,
  seenAt: string
) {
  const admin = createAdminClient();

  const tasks = [
    {
      name: "customer-last-seen",
      run: async () => {
        const { error } = await admin
          .from("customers")
          .update({ last_seen_at: seenAt })
          .eq("id", customerId)
          .or(`last_seen_at.is.null,last_seen_at.lt.${seenAt}`);

        if (error) throw error;
      },
    },
    {
      name: "lead-history",
      run: async () => {
        const { error } = await admin
          .from("lead_status_history")
          .insert({
            lead_id: leadId,
            old_status: null,
            new_status: "new",
            note: "Website lead submitted",
          });

        if (error) throw error;
      },
    },
    {
      name: "activity-log",
      run: async () => {
        const { error } = await admin
          .from("audit_logs")
          .insert({
            actor_id: null,
            event_type: "lead.created",
            target_type: "lead",
            target_id: leadId,
            details: {
              source: "website",
            },
          });

        if (error) throw error;
      },
    },
    {
      name: "notification",
      run: async () => {
        const { error } = await admin
          .from("notifications")
          .insert({
            title: "New website lead",
            message: "A new website enquiry has been received.",
            type: "info",
            target_url: `/crm/leads/${leadId}`,
            recipient_id: null,
            actor_id: null,
          });

        if (error) throw error;
      },
    },
  ];

  await Promise.all(
    tasks.map(async (task) => {
      try {
        await task.run();
      } catch {
        // Do not log enquiry text, contact details or secrets.
        console.error("[website-leads] Follow-up failed", {
          task: task.name,
          leadId,
        });
      }
    })
  );
}

export async function POST(request: NextRequest) {
  const expectedKey = process.env.WEBSITE_LEAD_API_KEY;

  if (!expectedKey) {
    return fail("Lead service is unavailable.", 503);
  }

  if (request.headers.get("x-api-key") !== expectedKey) {
    return fail("Unauthorized request.", 401);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return fail("JSON request required.", 415);
  }

  let raw: unknown;

  try {
    raw = await readBody(request);
  } catch (error) {
    const tooLarge =
      error instanceof Error &&
      error.message === "BODY_TOO_LARGE";

    return fail(
      tooLarge ? "Request is too large." : "Invalid JSON request.",
      tooLarge ? 413 : 400
    );
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return fail("Invalid request.", 400);
  }

  const body = raw as Record<string, unknown>;

  // Preserve field aliases supported by the existing API.
  const parsed = leadSchema.safeParse({
    ...body,
    name: body.name ?? body.customer_name,
    phone: body.phone ?? body.customer_phone ?? "",
    email: body.email ?? body.customer_email ?? "",
    service: body.service ?? "",
    message: body.message ?? body.note ?? "",
    page_url: body.page_url ?? "",
    referrer: body.referrer ?? "",
    utm_source: body.utm_source ?? "",
    utm_medium: body.utm_medium ?? "",
    utm_campaign: body.utm_campaign ?? "",
  });

  if (!parsed.success) {
    return fail("Please check your contact details and message.", 400);
  }

  const input = parsed.data;
  try { await validateContact(input.phone, input.email); }
  catch { return fail("Please supply the required phone or email contact.", 400); }
  const submissionId = typeof body.submission_id === "string" ? body.submission_id : randomUUID();
  if (!z.string().uuid().safeParse(submissionId).success) return fail("Invalid submission key.", 400);
  const fingerprint = submissionFingerprint(input);
  const seenAt = new Date().toISOString();

  let customerId: string;
  let leadId: string;

  try {
    const admin = createAdminClient();

    const previous = await findSubmission("leads", submissionId, fingerprint);
    if (previous) return reply({ success: true, lead_id: previous }, 200);
    await consumeContactQuota("leads", expectedKey, input.phone, input.email);
    customerId = await getOrCreateCustomer(admin, input);

    const saved = await saveSubmission("leads", submissionId, fingerprint, {
        customer_id: customerId,
        name: input.name,
        phone: input.phone || null,
        email: input.email || null,
        service: input.service || null,
        message: input.message || null,
        source: "website",
        status: "new",
        page_url: safePageUrl(input.page_url),
        referrer: safePageUrl(input.referrer),
        utm_source: input.utm_source || null,
        utm_medium: input.utm_medium || null,
        utm_campaign: input.utm_campaign || null,
      });
    leadId = saved.id;
    if (saved.replayed) return reply({ success: true, lead_id: leadId }, 200);
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTA_EXCEEDED") return fail("Too many requests. Please try again later.", 429);
    if (error instanceof Error && error.message === "QUOTA_UNAVAILABLE") return fail("Submission service temporarily unavailable.", 503);
    console.error("[website-leads] Submission was not confirmed.");

    return fail(
      "We could not confirm your submission. Please contact the business.",
      500
    );
  }

  // The lead is already saved. Ancillary work must not change
  // the successful submission response.
  try {
    after(async () => {
      try {
        await runFollowUps(leadId, customerId, seenAt);
      } catch {
        console.error("[website-leads] Follow-ups unavailable", {
          leadId,
        });
      }
    });
  } catch {
    console.error("[website-leads] Could not schedule follow-ups", {
      leadId,
    });
  }

  return reply(
    {
      success: true,
      lead_id: leadId,
      customer_id: customerId,
      message: "Lead submitted successfully.",
    },
    201
  );
}
