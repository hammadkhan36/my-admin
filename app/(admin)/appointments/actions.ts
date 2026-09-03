"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";
import { createNotification } from "@/lib/notifications";
import { checkAppointmentAvailability } from "@/lib/appointments/availability";


export type AppointmentActionState = {
  ok: boolean;
  message: string;
};


function success(message: string): AppointmentActionState {
  return { ok: true, message };
}

function failure(message: string): AppointmentActionState {
  return { ok: false, message };
}

async function getOrCreateCustomer(input: {
  name: string;
  phone: string;
  email: string | null;
  createdBy: string;
}) {
  const supabase = await createClient();
  const phone = input.phone.replace(/[^\d+]/g, "");

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      phone,
      email: input.email,
      created_by: input.createdBy,
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function createAppointment(formData: FormData) {
  await requirePermission("appointments.create");
  const profile = await requireProfile();
  const supabase = await createClient();

  const customerName = String(formData.get("customer_name") || "").trim();
  const customerPhone = String(formData.get("customer_phone") || "").trim();
  const customerEmail = String(formData.get("customer_email") || "").trim() || null;
  const serviceId = String(formData.get("service_id") || "") || null;
  const appointmentDate = String(formData.get("appointment_date") || "");
const appointmentTime = String(formData.get("appointment_time") || "").slice(0, 5);
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!customerName || !customerPhone || !appointmentDate || !appointmentTime) {
    throw new Error("Name, phone, date and time are required.");
  }

  const availability = await checkAppointmentAvailability({
  appointmentDate,
  appointmentTime,
   serviceId,
});

if (!availability.available) {
  throw new Error(availability.reason || "Selected appointment time is not available.");
}

  const customerId = await getOrCreateCustomer({
    name: customerName,
    phone: customerPhone,
    email: customerEmail,
    createdBy: profile.id,
  });

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: customerId,
      service_id: serviceId,
      customer_name: customerName,
      customer_phone: customerPhone.replace(/[^\d+]/g, ""),
      customer_email: customerEmail,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      notes,
      source: "manual",
      status: "pending",
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "appointment.created",
    targetType: "appointment",
    targetId: data.id,
    details: { customer_name: customerName, date: appointmentDate, time: appointmentTime },
  });

  await createNotification({
    title: "New appointment created",
    message: `${customerName} appointment request added.`,
    type: "info",
    targetUrl: "/appointments",
    actorId: profile.id,
  });

  revalidatePath("/appointments");
  revalidatePath("/crm/customers");
}

export async function createAppointmentSafe(
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  try {
    await createAppointment(formData);
    return success("Appointment created successfully.");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Appointment could not be created.";

    return failure(message);
  }
}


export async function updateAppointmentStatus(formData: FormData) {
  await requirePermission("appointments.update");
  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !status) throw new Error("Appointment id and status are required.");

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "appointment.status_updated",
    targetType: "appointment",
    targetId: id,
    details: { status },
  });

  await createNotification({
    title: "Appointment status updated",
    message: `Appointment marked as ${status}.`,
    type: "info",
    targetUrl: "/appointments",
    actorId: profile.id,
  });

  revalidatePath("/appointments");
}

export async function updateAppointmentDetails(formData: FormData) {
  await requirePermission("appointments.update");
  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const serviceId = String(formData.get("service_id") || "") || null;
  const appointmentDate = String(formData.get("appointment_date") || "");
  const appointmentTime = String(formData.get("appointment_time") || "").slice(0, 5);
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!id || !appointmentDate || !appointmentTime) {
    throw new Error("Appointment id, date and time are required.");
  }

  const availability = await checkAppointmentAvailability({
    appointmentDate,
    appointmentTime,
    serviceId,
    ignoreAppointmentId: id,
  });

  if (!availability.available) {
    throw new Error(availability.reason || "Selected appointment time is not available.");
  }

  const { error } = await supabase
    .from("appointments")
    .update({
      service_id: serviceId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      notes,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "appointment.updated",
    targetType: "appointment",
    targetId: id,
    details: {
      date: appointmentDate,
      time: appointmentTime,
      service_id: serviceId,
    },
  });

  await createNotification({
    title: "Appointment updated",
    message: `Appointment was rescheduled to ${appointmentDate} at ${appointmentTime}.`,
    type: "info",
    targetUrl: `/appointments/${id}`,
    actorId: profile.id,
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
}

export async function updateAppointmentDetailsSafe(
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  try {
    await updateAppointmentDetails(formData);
    return success("Appointment updated successfully.");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Appointment could not be updated.";

    return failure(message);
  }
}

export async function deleteAppointment(formData: FormData) {
  await requirePermission("appointments.delete");
  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");

  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "appointment.deleted",
    targetType: "appointment",
    targetId: id,
  });

  revalidatePath("/appointments");
}