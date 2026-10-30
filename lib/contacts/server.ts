import "server-only";
import { createAdminClient } from "@/lib/supabase-admin";
import { normalizePhone } from "@/lib/phone-utils";

export async function validateContact(
  phoneValue: string,
  emailValue: string
) {
  const email = emailValue.trim().toLowerCase();

  if (
    email &&
    (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
  ) {
    throw new Error("Enter a valid email address.");
  }

  const admin = createAdminClient();
  const [settings, business] = await Promise.all([
    admin
      .from("communication_settings")
      .select("contact_mode")
      .eq("id", true)
      .single(),
    admin
      .from("business_settings")
      .select("default_country_code")
      .limit(1)
      .maybeSingle(),
  ]);

  const data = settings.data;

  if (settings.error || !data || business.error) {
    throw new Error("Contact settings are unavailable.");
  }

  // Same E.164 form the database uses, so 0300... and +92300... match one customer.
  const phone = phoneValue.trim()
    ? normalizePhone(phoneValue, business.data?.default_country_code ?? "+92")
    : "";

  if (phone === null) {
    throw new Error("Enter a valid phone number.");
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
