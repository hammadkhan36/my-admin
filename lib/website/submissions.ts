import "server-only";
import { createHash, createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase-admin";
type Table = "leads" | "appointments";
export function submissionFingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export async function findSubmission(table: Table, id: string, fingerprint: string) {
  const { data, error } = await createAdminClient().from(table).select("id,request_fingerprint").eq("submission_id", id).maybeSingle();
  if (error) throw new Error("Submission lookup failed.");
  if (data && data.request_fingerprint !== fingerprint) throw new Error("Submission key was already used for different details. Reload the form.");
  return data?.id as string | undefined;
}
export async function saveSubmission(table: Table, id: string, fingerprint: string, row: Record<string, unknown>) {
  const { data, error } = await createAdminClient().from(table).insert({ ...row, submission_id: id, request_fingerprint: fingerprint }).select("id").single();
  if (!error && data) return { id: data.id as string, replayed: false };
  if (error?.code === "23505") {
    const found = await findSubmission(table, id, fingerprint);
    if (found) return { id: found, replayed: true };
  }
  if (error?.code === "23P01") throw new Error("This appointment time was just booked. Choose another time.");
  throw new Error("Submission could not be saved.");
}

// Server-side repeated-contact quota. Replayed submissions are checked first.
export async function consumeContactQuota(scope: Table, secret: string, phone: string, email: string | null) {
  const contacts = [phone.replace(/[\s().-]/g, ""), (email || "").trim().toLowerCase()].filter(Boolean);
  for (const contact of contacts) {
    const key = createHmac("sha256", secret).update(`${scope}:${contact}`).digest("hex");
    const { data, error } = await createAdminClient().rpc("consume_submission_quota", { p_key: key });
    if (error || typeof data !== "boolean") throw new Error("QUOTA_UNAVAILABLE");
    if (!data) throw new Error("QUOTA_EXCEEDED");
  }
}
