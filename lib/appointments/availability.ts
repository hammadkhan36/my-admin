// import { createAdminClient } from "@/lib/supabase-admin";

// type AvailabilityResult = {
//     available: boolean;
//     reason?: string;
// };

// function timeToMinutes(time: string) {
//     const [hours, minutes] = time.split(":").map(Number);
//     return hours * 60 + minutes;
// }

// export async function checkAppointmentAvailability(input: {
//     appointmentDate: string;
//     appointmentTime: string;
//     serviceId?: string | null;
//     ignoreAppointmentId?: string | null;
// }): Promise<AvailabilityResult> {
//     const supabase = createAdminClient();

//     const date = new Date(`${input.appointmentDate}T00:00:00`);
//     const dayOfWeek = date.getDay();

//     const { data: hours, error } = await supabase
//         .from("business_hours")
//         .select("day_of_week, opens_at, closes_at, is_closed, is_24h")
//         .eq("day_of_week", dayOfWeek)
//         .maybeSingle();

//     if (error) {
//         return {
//             available: false,
//             reason: error.message,
//         };
//     }

//     if (!hours) {
//         return {
//             available: false,
//             reason: "Business hours are not configured for this day.",
//         };
//     }

//     if (hours.is_closed) {
//         return {
//             available: false,
//             reason: "Business is closed on this day.",
//         };
//     }

//     if (hours.is_24h) {
//         return { available: true };
//     }

//     if (!hours.opens_at || !hours.closes_at) {
//         return {
//             available: false,
//             reason: "Opening and closing time is missing for this day.",
//         };
//     }

//     const requestedMinutes = timeToMinutes(input.appointmentTime);
//     const openMinutes = timeToMinutes(hours.opens_at);
//     const closeMinutes = timeToMinutes(hours.closes_at);

//     if (requestedMinutes < openMinutes || requestedMinutes >= closeMinutes) {
//         return {
//             available: false,
//             reason: `Selected time is outside business hours.`,
//         };
//     }

//     // if (input.serviceId) {
//     //     const { data: existingAppointment, error: appointmentError } = await supabase
//     //         .from("appointments")
//     //         .select("id")
//     //         .eq("appointment_date", input.appointmentDate)
//     //         .eq("appointment_time", input.appointmentTime)
//     //         .eq("service_id", input.serviceId)
//     //         .in("status", ["pending", "approved"])
//     //         .maybeSingle();

//     //     if (appointmentError) {
//     //         return {
//     //             available: false,
//     //             reason: appointmentError.message,
//     //         };
//     //     }

//     //     if (existingAppointment) {
//     //         return {
//     //             available: false,
//     //             reason: "This service is already booked for the selected time.",
//     //         };
//     //     }
//     // }


//     if (input.serviceId) {
//   let query = supabase
//     .from("appointments")
//     .select("id")
//     .eq("appointment_date", input.appointmentDate)
//     .eq("appointment_time", input.appointmentTime)
//     .eq("service_id", input.serviceId)
//     .in("status", ["pending", "approved"]);

//   if (input.ignoreAppointmentId) {
//     query = query.neq("id", input.ignoreAppointmentId);
//   }

//   const { data: existingAppointment, error: appointmentError } = await query.maybeSingle();

//   if (appointmentError) {
//     return {
//       available: false,
//       reason: appointmentError.message,
//     };
//   }

//   if (existingAppointment) {
//     return {
//       available: false,
//       reason: "This service is already booked for the selected time.",
//     };
//   }
// }


//     return { available: true };
// }












import { createAdminClient } from "@/lib/supabase-admin";

type AvailabilityResult = {
  available: boolean;
  reason?: string;
};

function timeToMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function formatTime(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

function getDayOfWeek(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  return date.getDay();
}

export async function checkAppointmentAvailability(input: {
  appointmentDate: string;
  appointmentTime: string;
  serviceId?: string | null;
  ignoreAppointmentId?: string | null;
}): Promise<AvailabilityResult> {
  const supabase = createAdminClient();

  const dayOfWeek = getDayOfWeek(input.appointmentDate);

  const { data: hours, error } = await supabase
    .from("business_hours")
    .select("day_of_week, opens_at, closes_at, is_closed, is_24h")
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();

  if (error) {
    return { available: false, reason: error.message };
  }

  if (!hours) {
    return {
      available: false,
      reason: "Business hours are not configured for this day.",
    };
  }

  if (hours.is_closed) {
    return {
      available: false,
      reason: "Business is closed on this day.",
    };
  }

  if (!hours.is_24h) {
    if (!hours.opens_at || !hours.closes_at) {
      return {
        available: false,
        reason: "Opening and closing time is missing for this day.",
      };
    }

    const requestedMinutes = timeToMinutes(formatTime(input.appointmentTime));
    const openMinutes = timeToMinutes(formatTime(hours.opens_at));
    const closeMinutes = timeToMinutes(formatTime(hours.closes_at));

    if (requestedMinutes < openMinutes || requestedMinutes >= closeMinutes) {
      return {
        available: false,
        reason: `Selected time is outside business hours. Open time is ${formatTime(
          hours.opens_at
        )} to ${formatTime(hours.closes_at)}.`,
      };
    }
  }

  if (input.serviceId) {
    let query = supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", input.appointmentDate)
      .eq("appointment_time", formatTime(input.appointmentTime))
      .eq("service_id", input.serviceId)
      .in("status", ["pending", "approved"]);

    if (input.ignoreAppointmentId) {
      query = query.neq("id", input.ignoreAppointmentId);
    }

    const { data: existingAppointment, error: appointmentError } =
      await query.maybeSingle();

    if (appointmentError) {
      return { available: false, reason: appointmentError.message };
    }

    if (existingAppointment) {
      return {
        available: false,
        reason: "This service is already booked for the selected time.",
      };
    }
  }

  return { available: true };
}