import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity-log";
import { checkAppointmentAvailability } from "@/lib/appointments/availability";

function cleanPhone(phone: string) {
    return phone.replace(/[^\d+]/g, "");
}

async function getOrCreateCustomer(input: {
    name: string;
    phone: string;
    email: string | null;
}) {
    const supabase = createAdminClient();
    const phone = cleanPhone(input.phone);

    const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

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

    if (!process.env.WEBSITE_APPOINTMENT_API_KEY || apiKey !== process.env.WEBSITE_APPOINTMENT_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const customerName = String(body.customer_name || body.name || "").trim();
        const customerPhone = String(body.customer_phone || body.phone || "").trim();
        const customerEmail = String(body.customer_email || body.email || "").trim() || null;
        const serviceId = String(body.service_id || "").trim() || null;
        const appointmentDate = String(body.appointment_date || "").trim();
        const appointmentTime = String(body.appointment_time || "").trim();
        const notes = String(body.notes || body.message || "").trim() || null;

        if (!customerName || !customerPhone || !appointmentDate || !appointmentTime) {
            return NextResponse.json(
                { error: "Name, phone, date and time are required." },
                { status: 400 }
            );
        }

        const availability = await checkAppointmentAvailability({
            appointmentDate,
            appointmentTime,
            serviceId,
        });

        if (!availability.available) {
            return NextResponse.json(
                { error: availability.reason || "Selected appointment time is not available." },
                { status: 400 }
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

        return NextResponse.json({
            success: true,
            appointment_id: data.id,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong.";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}