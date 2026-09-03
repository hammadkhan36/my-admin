// import { NextRequest, NextResponse } from "next/server";
// import { createAdminClient } from "@/lib/supabase-admin";
// import { createNotification } from "@/lib/notifications";
// import { logActivity } from "@/lib/activity-log";
// import { checkAppointmentAvailability } from "@/lib/appointments/availability";

// function cleanPhone(phone: string) {
//     return phone.replace(/[^\d+]/g, "");
// }

// async function getOrCreateCustomer(input: {
//     name: string;
//     phone: string;
//     email: string | null;
// }) {
//     const supabase = createAdminClient();
//     const phone = cleanPhone(input.phone);

//     const { data: existing } = await supabase
//         .from("customers")
//         .select("id")
//         .eq("phone", phone)
//         .maybeSingle();

//     if (existing) return existing.id as string;

//     const { data, error } = await supabase
//         .from("customers")
//         .insert({
//             name: input.name,
//             phone,
//             email: input.email,
//             last_seen_at: new Date().toISOString(),
//         })
//         .select("id")
//         .single();

//     if (error) throw new Error(error.message);

//     return data.id as string;
// }

// export async function POST(request: NextRequest) {
//     const apiKey = request.headers.get("x-api-key");

//     if (!process.env.WEBSITE_APPOINTMENT_API_KEY || apiKey !== process.env.WEBSITE_APPOINTMENT_API_KEY) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         const body = await request.json();

//         const customerName = String(body.customer_name || body.name || "").trim();
//         const customerPhone = String(body.customer_phone || body.phone || "").trim();
//         const customerEmail = String(body.customer_email || body.email || "").trim() || null;
//         const serviceId = String(body.service_id || "").trim() || null;
//         const appointmentDate = String(body.appointment_date || "").trim();
//         const appointmentTime = String(body.appointment_time || "").trim();
//         const notes = String(body.notes || body.message || "").trim() || null;

//         if (!customerName || !customerPhone || !appointmentDate || !appointmentTime) {
//             return NextResponse.json(
//                 { error: "Name, phone, date and time are required." },
//                 { status: 400 }
//             );
//         }

//         const availability = await checkAppointmentAvailability({
//             appointmentDate,
//             appointmentTime,
//             serviceId,
//         });

//         if (!availability.available) {
//             return NextResponse.json(
//                 { error: availability.reason || "Selected appointment time is not available." },
//                 { status: 400 }
//             );
//         }

//         const supabase = createAdminClient();

//         const customerId = await getOrCreateCustomer({
//             name: customerName,
//             phone: customerPhone,
//             email: customerEmail,
//         });

//         const { data, error } = await supabase
//             .from("appointments")
//             .insert({
//                 customer_id: customerId,
//                 service_id: serviceId,
//                 customer_name: customerName,
//                 customer_phone: cleanPhone(customerPhone),
//                 customer_email: customerEmail,
//                 appointment_date: appointmentDate,
//                 appointment_time: appointmentTime,
//                 notes,
//                 source: "website",
//                 status: "pending",
//             })
//             .select("id")
//             .single();

//         if (error) throw new Error(error.message);

//         await logActivity({
//             eventType: "appointment.website_requested",
//             targetType: "appointment",
//             targetId: data.id,
//             details: {
//                 customer_name: customerName,
//                 date: appointmentDate,
//                 time: appointmentTime,
//             },
//         });

//         await createNotification({
//             title: "New website appointment",
//             message: `${customerName} requested an appointment from the website.`,
//             type: "info",
//             targetUrl: "/appointments",
//         });

//         return NextResponse.json({
//             success: true,
//             appointment_id: data.id,
//         });
//     } catch (error) {
//         const message = error instanceof Error ? error.message : "Something went wrong.";

//         return NextResponse.json({ error: message }, { status: 500 });
//     }
// }





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
















// async function submitAppointment() {
//   const response = await fetch("https://your-admin-domain.com/api/public/appointments", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": process.env.NEXT_PUBLIC_WEBSITE_APPOINTMENT_API_KEY!,
//     },
//     body: JSON.stringify({
//       customer_name: "Ali Khan",
//       customer_phone: "+923001234567",
//       customer_email: "ali@example.com",
//       service_id: "SERVICE_ID_HERE",
//       appointment_date: "2026-09-10",
//       appointment_time: "14:30",
//       notes: "I need a callback before appointment.",
//     }),
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     alert(result.error || "Appointment request failed.");
//     return;
//   }

//   alert(result.message || "Appointment request submitted.");
// }
