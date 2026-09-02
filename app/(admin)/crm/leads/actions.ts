"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

type LeadActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const leadSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters"),
  phone: z.string().trim().min(6, "Phone number is required"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  service: z.string().trim().optional(),
  message: z.string().trim().optional(),
  source: z.string().trim().default("manual"),
  status: z.string().trim().default("new"),
  priority: z.string().trim().default("normal"),
});

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

async function getOrCreateCustomer({
  actorId,
  name,
  phone,
  email,
}: {
  actorId: string;
  name: string;
  phone: string;
  email?: string;
}) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    await admin
      .from("customers")
      .update({
        name,
        email: email || null,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return existing.id as string;
  }

  const { data, error } = await admin
    .from("customers")
    .insert({
      name,
      phone,
      email: email || null,
      created_by: actorId,
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId,
    eventType: "customer.created",
    targetType: "customer",
    targetId: data.id,
    details: { name, phone, source: "lead" },
  });

  return data.id as string;
}

export async function createLead(
  _previousState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const actor = await requirePermission("leads.create");

  const result = leadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    service: formData.get("service"),
    message: formData.get("message"),
    source: formData.get("source") || "manual",
    status: formData.get("status") || "new",
    priority: formData.get("priority") || "normal",
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const phone = normalizePhone(result.data.phone);
  const admin = createAdminClient();

  try {
    const customerId = await getOrCreateCustomer({
      actorId: actor.id,
      name: result.data.name,
      phone,
      email: result.data.email || undefined,
    });

    const { data, error } = await admin
      .from("leads")
      .insert({
        customer_id: customerId,
        name: result.data.name,
        phone,
        email: result.data.email || null,
        service: result.data.service || null,
        message: result.data.message || null,
        source: result.data.source,
        status: result.data.status,
        priority: result.data.priority,
        created_by: actor.id,
      })
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    await admin.from("lead_status_history").insert({
      lead_id: data.id,
      old_status: null,
      new_status: result.data.status,
      changed_by: actor.id,
    });

    await logActivity({
      actorId: actor.id,
      eventType: "lead.created",
      targetType: "lead",
      targetId: data.id,
      details: {
        name: result.data.name,
        phone,
        customer_id: customerId,
        source: result.data.source,
      },
    });

    revalidatePath("/crm/leads");
    revalidatePath("/crm/customers");

    return {
      success: true,
      message: "Lead created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lead could not be created.",
    };
  }
}

export async function deleteLead(leadId: string) {
  const actor = await requirePermission("leads.delete");

  if (!z.string().uuid().safeParse(leadId).success) return;

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .select("name, phone")
    .eq("id", leadId)
    .maybeSingle();

  await admin.from("leads").delete().eq("id", leadId);

  await logActivity({
    actorId: actor.id,
    eventType: "lead.deleted",
    targetType: "lead",
    targetId: leadId,
    details: {
      name: lead?.name,
      phone: lead?.phone,
    },
  });

  revalidatePath("/crm/leads");
}




const statusSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["new", "contacted", "qualified", "won", "lost"]),
});

const noteSchema = z.object({
  leadId: z.string().uuid(),
  note: z.string().trim().min(2, "Note must contain at least 2 characters"),
});

export async function updateLeadStatus(formData: FormData) {
  const actor = await requirePermission("leads.update");

  const result = statusSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });

  if (!result.success) {
    throw new Error("Invalid lead status");
  }

  const admin = createAdminClient();

  const { data: currentLead } = await admin
    .from("leads")
    .select("status, name")
    .eq("id", result.data.leadId)
    .maybeSingle();

  if (!currentLead) {
    throw new Error("Lead not found");
  }

  if (currentLead.status === result.data.status) {
    return;
  }

  const { error } = await admin
    .from("leads")
    .update({
      status: result.data.status,
    })
    .eq("id", result.data.leadId);

  if (error) {
    throw new Error(error.message);
  }

  await admin.from("lead_status_history").insert({
    lead_id: result.data.leadId,
    old_status: currentLead.status,
    new_status: result.data.status,
    changed_by: actor.id,
  });

  await logActivity({
    actorId: actor.id,
    eventType: "lead.status_changed",
    targetType: "lead",
    targetId: result.data.leadId,
    details: {
      name: currentLead.name,
      old_status: currentLead.status,
      new_status: result.data.status,
    },
  });

  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${result.data.leadId}`);
}

export async function addLeadNote(
  _previousState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const actor = await requirePermission("leads.update");

  const result = noteSchema.safeParse({
    leadId: formData.get("leadId"),
    note: formData.get("note"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const admin = createAdminClient();

  const { error } = await admin.from("lead_notes").insert({
    lead_id: result.data.leadId,
    note: result.data.note,
    created_by: actor.id,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  await logActivity({
    actorId: actor.id,
    eventType: "lead.note_added",
    targetType: "lead",
    targetId: result.data.leadId,
  });

  revalidatePath(`/crm/leads/${result.data.leadId}`);

  return {
    success: true,
    message: "Note added successfully.",
  };
}