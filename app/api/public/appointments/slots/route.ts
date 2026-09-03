import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

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

function timeToMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTime(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

function getDayOfWeek(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  return date.getDay();
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (
    !process.env.WEBSITE_APPOINTMENT_API_KEY ||
    apiKey !== process.env.WEBSITE_APPOINTMENT_API_KEY
  ) {
    return fail("Unauthorized request.", 401);
  }

  const date = request.nextUrl.searchParams.get("date") || "";
  const serviceId = request.nextUrl.searchParams.get("service_id") || null;
  const interval = Number(request.nextUrl.searchParams.get("interval") || 30);

  if (!date) return fail("Date is required.");
  if (![15, 30, 45, 60].includes(interval)) {
    return fail("Interval must be 15, 30, 45 or 60 minutes.");
  }

  const supabase = createAdminClient();
  const dayOfWeek = getDayOfWeek(date);

  const { data: hours, error: hoursError } = await supabase
    .from("business_hours")
    .select("opens_at, closes_at, is_closed, is_24h")
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();

  if (hoursError) return fail(hoursError.message, 500);

  if (!hours) {
    return ok({
      date,
      slots: [],
      message: "Business hours are not configured for this day.",
    });
  }

  if (hours.is_closed) {
    return ok({
      date,
      slots: [],
      message: "Business is closed on this day.",
    });
  }

  const openTime = hours.is_24h ? "00:00" : formatTime(hours.opens_at);
  const closeTime = hours.is_24h ? "23:59" : formatTime(hours.closes_at);

  if (!openTime || !closeTime) {
    return ok({
      date,
      slots: [],
      message: "Opening and closing time is missing for this day.",
    });
  }

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  const slots: string[] = [];

  for (let minutes = openMinutes; minutes < closeMinutes; minutes += interval) {
    slots.push(minutesToTime(minutes));
  }

  let availableSlots = slots;

  if (serviceId) {
    const { data: booked, error: bookedError } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("appointment_date", date)
      .eq("service_id", serviceId)
      .in("status", ["pending", "approved"]);

    if (bookedError) return fail(bookedError.message, 500);

    const bookedTimes = new Set(
      (booked ?? []).map((item) => formatTime(item.appointment_time))
    );

    availableSlots = slots.filter((slot) => !bookedTimes.has(slot));
  }

  return ok({
    date,
    service_id: serviceId,
    interval,
    slots: availableSlots,
  });
}   











// Step 3: Test API

// Thunder Client/Postman me:

// GET http://localhost:3000/api/public/appointments/slots?date=2026-09-10&interval=30

// Headers:

// x-api-key: change-this-strong-secret-key

// Agar service ke booked slots remove karne hain:

// GET http://localhost:3000/api/public/appointments/slots?date=2026-09-10&service_id=SERVICE_ID&interval=30
// Step 4: Expected Results
// Situation	Result
// Business closed	slots: []
// Hours 09:00-17:00	09:00 se 16:30 tak slots
// Interval 60	hourly slots
// Same service booked 10:00	10:00 slots se remove
// Different service booked 10:00	slot available rahega