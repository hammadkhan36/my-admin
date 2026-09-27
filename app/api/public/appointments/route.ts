import { randomUUID } from "node:crypto";
import { consumeContactQuota, findSubmission, saveSubmission, submissionFingerprint } from "@/lib/website/submissions";
import { after } from "next/server";
import { resolveCustomer, validateContact } from "@/lib/contacts/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity-log";
import { checkAppointmentAvailability } from "@/lib/appointments/availability";

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

async function getOrCreateCustomer(input: { name: string; phone: string; email: string | null }) {
  return resolveCustomer(input);
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (
    !process.env.WEBSITE_APPOINTMENT_API_KEY ||
    apiKey !== process.env.WEBSITE_APPOINTMENT_API_KEY
  ) {
    return fail("Unauthorized request.", 401);
  }

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 16000) return fail("Request too large.", 413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid request.");

    const customerName = asString(body.customer_name || body.name);
    const customerPhone = asString(body.customer_phone || body.phone);
    const customerEmail = asString(body.customer_email || body.email) || null;
    const serviceId = asString(body.service_id) || null;
    const appointmentDate = asString(body.appointment_date);
    const appointmentTime = asString(body.appointment_time).slice(0, 5);
    const notes = asString(body.notes || body.message) || null;

    if (customerName.length < 2 || customerName.length > 100 || (notes?.length || 0) > 2000) return fail("Check name and notes.");
    try { await validateContact(customerPhone, customerEmail || ""); }
    catch { return fail("Please supply the required phone or email contact."); }
    if (!appointmentDate) return fail("Appointment date is required.");
    if (!appointmentTime) return fail("Appointment time is required.");

    const submissionId = typeof body.submission_id === "string" ? body.submission_id : randomUUID();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) return fail("Invalid submission key.");
    const fingerprint = submissionFingerprint({ customerName, customerPhone, customerEmail, serviceId, appointmentDate, appointmentTime, notes });
    const previous = await findSubmission("appointments", submissionId, fingerprint);
    if (previous) return ok({ appointment_id: previous });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) return fail("Invalid date or time.");
    if (!serviceId) return fail("Choose a service.");
    const service = await createAdminClient().from("services").select("id").eq("id", serviceId).eq("is_active", true).eq("show_on_website", true).maybeSingle();
    if (service.error || !service.data) return fail("Service unavailable.");
    const availability = await checkAppointmentAvailability({
      appointmentDate,
      appointmentTime,
      serviceId,
    });

    if (!availability.available) {
      return fail(
        availability.reason || "Selected appointment time is not available."
      );
    }

    await consumeContactQuota("appointments", process.env.WEBSITE_APPOINTMENT_API_KEY!, customerPhone, customerEmail);
    const supabase = createAdminClient();

    const customerId = await getOrCreateCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    });

    const saved = await saveSubmission("appointments", submissionId, fingerprint, {
        customer_id: customerId,
        service_id: serviceId,
        customer_name: customerName,
        customer_phone: cleanPhone(customerPhone) || null,
        customer_email: customerEmail,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes,
        source: "website",
        status: "pending",
      });
    const data = { id: saved.id };
    if (saved.replayed) return ok({ appointment_id: data.id });

    after(async () => {
      try {
    await supabase.from("appointment_status_history").insert({
      appointment_id: data.id,
      old_status: null,
      new_status: "pending",
      note: "Website appointment requested",
    });

    await logActivity({
      eventType: "appointment.website_requested",
      targetType: "appointment",
      targetId: data.id,
      details: {
        customer_name: customerName,
        date: appointmentDate,
        time: appointmentTime,
      },
    });

    await createNotification({
      title: "New website appointment",
      message: `${customerName} requested an appointment from the website.`,
      type: "info",
      targetUrl: "/appointments",
    });

      } catch { console.error("[appointments] Follow-up failed", { appointmentId: data.id }); }
    });

    return ok({
      appointment_id: data.id,
      message: "Appointment request submitted successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Appointment request failed.";

    if (message === "QUOTA_EXCEEDED") return fail("Too many requests. Please try again later.", 429);
    if (message === "QUOTA_UNAVAILABLE") return fail("Booking service temporarily unavailable.", 503);
    console.error("[appointments] Submission not confirmed.");
    if (message === "This appointment time was just booked. Choose another time.") return fail(message, 409);
    return fail("Appointment request could not be confirmed.", 500);
  }
}
