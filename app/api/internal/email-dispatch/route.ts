import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
function reply(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return reply({ error: "Dispatcher unavailable" }, 503);
  const actual = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return reply({ error: "Unauthorized" }, 401);
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  let origin: string;
  try {
    const url = new URL(process.env.ADMIN_SITE_URL || "");
    if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    origin = url.origin;
  } catch { return reply({ error: "Configure a valid HTTPS ADMIN_SITE_URL" }, 503); }
  if (!key || !from) return reply({ error: "Resend is not configured" }, 503);
  const db = createAdminClient();
  const { data: jobs, error } = await db.rpc("claim_admin_emails", { p_from: from, p_admin_origin: origin });
  if (error) return reply({ error: "Could not claim email" }, 500);
  const job = jobs?.[0];
  if (!job) return reply({ processed: 0 });
  let providerId: string | null = null;
  let failure: string | null = null;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `admin-email/${job.id}` },
      body: JSON.stringify(job.request_body), signal: AbortSignal.timeout(12_000), cache: "no-store",
    });
    const payload: unknown = await response.json().catch(() => null);
    if (response.ok && payload && typeof payload === "object" && "id" in payload && typeof payload.id === "string") providerId = payload.id;
    else failure = `Resend HTTP ${response.status}; inspect provider dashboard`;
  } catch { failure = "Resend response unknown; retry using the same idempotency key"; }
  const { data: finished, error: finishError } = await db.rpc("finish_admin_email", {
    p_id: job.id, p_token: job.lease_token, p_provider_id: providerId, p_error: failure,
  });
  if (finishError || !finished) return reply({ error: "Delivery outcome could not be recorded; lease recovery will retry safely" }, 503);
  return reply({ processed: 1, status: providerId ? "accepted" : "retry_or_failed" });
}
export const GET = POST;
