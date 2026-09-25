import "server-only";
import { createAdminClient } from "@/lib/supabase-admin";

export async function validateContact(
  phoneValue: string,
  emailValue: string
) {
  const phone = phoneValue.trim().replace(/[\s().-]/g, "");
  const email = emailValue.trim().toLowerCase();

  if (phone && !/^\+?\d{7,15}$/.test(phone)) {
    throw new Error("Enter a valid phone number.");
  }

  if (
    email &&
    (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
  ) {
    throw new Error("Enter a valid email address.");
  }

  const { data, error } = await createAdminClient()
    .from("communication_settings")
    .select("contact_mode")
    .eq("id", true)
    .single();

  if (error || !data) {
    throw new Error("Contact settings are unavailable.");
  }

  if (data.contact_mode === "phone" && !phone) {
    throw new Error("Phone number is required.");
  }

  if (data.contact_mode === "email" && !email) {
    throw new Error("Email address is required.");
  }

  return {
    phone: phone || null,
    email: email || null,
  };
}

// Call only after permission/API-key checks.
// Existing customer details are not overwritten.
export async function resolveCustomer(input: {
  name: string;
  phone: string;
  email?: string | null;
  actorId?: string | null;
}) {
  const contact = await validateContact(
    input.phone,
    input.email || ""
  );

  const { data, error } = await createAdminClient().rpc(
    "resolve_business_customer",
    {
      p_name: input.name,
      p_phone: contact.phone,
      p_email: contact.email,
      p_actor: input.actorId || null,
    }
  );

  if (error || typeof data !== "string") {
    throw new Error(
      "Customer could not be matched. Check the required contact and duplicate CRM records."
    );
  }

  return data;
}
