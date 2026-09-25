"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { validateContact } from "@/lib/contacts/server";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

type CustomerActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name must contain at most 100 characters"),

  phone: z.string().trim().max(30).default(""),

  email: z
    .string()
    .trim()
    .max(254)
    .email("Enter a valid email")
    .or(z.literal("")),

  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  tags: z.string().trim().optional(),
});

function readCustomerFields(formData: FormData) {
  return {
    name: formData.get("name") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    address: formData.get("address") || "",
    notes: formData.get("notes") || "",
    tags: formData.get("tags") || "",
  };
}

function parseTags(tags?: string) {
  if (!tags) return [];

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function databaseMessage(error: {
  code?: string;
  message: string;
}) {
  if (error.code === "23505") {
    return "A customer with this primary contact already exists.";
  }

  return "Customer could not be saved. Check the details and try again.";
}

export async function createCustomer(
  _previousState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const actor = await requirePermission("customers.create");

  const result = customerSchema.safeParse(
    readCustomerFields(formData)
  );

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  let contact: {
    phone: string | null;
    email: string | null;
  };

  try {
    contact = await validateContact(
      result.data.phone,
      result.data.email
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid contact details.",
    };
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("customers")
    .insert({
      name: result.data.name,
      phone: contact.phone,
      email: contact.email,
      address: result.data.address || null,
      notes: result.data.notes || null,
      tags: parseTags(result.data.tags),
      created_by: actor.id,
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      message: error
        ? databaseMessage(error)
        : "Customer could not be created.",
    };
  }

  try {
    await logActivity({
      actorId: actor.id,
      eventType: "customer.created",
      targetType: "customer",
      targetId: data.id,
      details: {
        name: result.data.name,
        phone: contact.phone,
      },
    });
  } catch {
    console.error("[customers] Create audit log failed", {
      customerId: data.id,
    });
  }

  revalidatePath("/crm/customers");

  return {
    success: true,
    message: "Customer created successfully.",
  };
}

export async function updateCustomer(
  _previousState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const actor = await requirePermission("customers.update");

  const result = customerSchema
    .extend({
      id: z.string().uuid(),
    })
    .safeParse({
      ...readCustomerFields(formData),
      id: formData.get("id"),
    });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  let contact: {
    phone: string | null;
    email: string | null;
  };

  try {
    contact = await validateContact(
      result.data.phone,
      result.data.email
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid contact details.",
    };
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("customers")
    .update({
      name: result.data.name,
      phone: contact.phone,
      email: contact.email,
      address: result.data.address || null,
      notes: result.data.notes || null,
      tags: parseTags(result.data.tags),
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", result.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      message: error
        ? databaseMessage(error)
        : "Customer not found. Refresh the page.",
    };
  }

  try {
    await logActivity({
      actorId: actor.id,
      eventType: "customer.updated",
      targetType: "customer",
      targetId: data.id,
      details: {
        name: result.data.name,
        phone: contact.phone,
      },
    });
  } catch {
    console.error("[customers] Update audit log failed", {
      customerId: data.id,
    });
  }

  revalidatePath("/crm/customers");
  revalidatePath(`/crm/customers/${data.id}`);

  return {
    success: true,
    message: "Customer updated successfully.",
  };
}

export async function deleteCustomer(customerId: string) {
  const actor = await requirePermission("customers.delete");

  if (!z.string().uuid().safeParse(customerId).success) {
    return;
  }

  const admin = createAdminClient();

  const { data: customer, error } = await admin
    .from("customers")
    .delete()
    .eq("id", customerId)
    .select("id, name, phone")
    .maybeSingle();

  if (error || !customer) {
    return;
  }

  try {
    await logActivity({
      actorId: actor.id,
      eventType: "customer.deleted",
      targetType: "customer",
      targetId: customer.id,
      details: {
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch {
    console.error("[customers] Delete audit log failed", {
      customerId,
    });
  }

  revalidatePath("/crm/customers");
}
