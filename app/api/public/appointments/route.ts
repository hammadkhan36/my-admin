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
  if (existing) return existing.id as string;

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

  if (
    !process.env.WEBSITE_APPOINTMENT_API_KEY ||
    apiKey !== process.env.WEBSITE_APPOINTMENT_API_KEY
  ) {
    return fail("Unauthorized request.", 401);
  }

  try {
    const body = await request.json();

    const customerName = asString(body.customer_name || body.name);
    const customerPhone = asString(body.customer_phone || body.phone);
    const customerEmail = asString(body.customer_email || body.email) || null;
    const serviceId = asString(body.service_id) || null;
    const appointmentDate = asString(body.appointment_date);
    const appointmentTime = asString(body.appointment_time).slice(0, 5);
    const notes = asString(body.notes || body.message) || null;

    if (!customerName) return fail("Customer name is required.");
    if (!customerPhone) return fail("Customer phone is required.");
    if (!appointmentDate) return fail("Appointment date is required.");
    if (!appointmentTime) return fail("Appointment time is required.");
    if (!serviceId) return fail("Please choose a service.");
    const visible=await createAdminClient().from("services").select("id").eq("id",serviceId).eq("is_active",true).eq("show_on_website",true).maybeSingle();
    if(visible.error||!visible.data)return fail("This service is not available online.");

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

    const supabase = createAdminClient();

    const customerId = await getOrCreateCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    });

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        customer_name: customerName,
        customer_phone: cleanPhone(customerPhone),
        customer_email: customerEmail,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes,
        source: "website",
        status: "pending",
      })
      .select("id")
      .single();

    if (error?.code === "23505" || error?.code === "23P01") return fail("This time was just requested. Please choose another time.", 409);
    if (error) throw new Error(error.message);

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

    return ok({
      appointment_id: data.id,
      message: "Appointment request submitted successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Appointment request failed.";

    return fail(message, 500);
  }
}
















