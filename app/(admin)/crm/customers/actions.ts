"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/server";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase-admin";

type CustomerActionState = {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
};

const customerSchema = z.object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters"),
    phone: z.string().trim().min(6, "Phone number is required"),
    email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
    address: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    tags: z.string().trim().optional(),
});

function normalizePhone(phone: string) {
    return phone.replace(/[^\d+]/g, "");
}

function parseTags(tags?: string) {
    if (!tags) return [];
    return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

export async function createCustomer(
    _previousState: CustomerActionState,
    formData: FormData
): Promise<CustomerActionState> {
    const actor = await requirePermission("customers.create");

    const result = customerSchema.safeParse({
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        notes: formData.get("notes"),
        tags: formData.get("tags"),
    });

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
        };
    }

    const phone = normalizePhone(result.data.phone);
    const admin = createAdminClient();

    const { data: existing } = await admin
        .from("customers")
        .select("id, name")
        .eq("phone", phone)
        .maybeSingle();

    if (existing) {
        await logActivity({
            actorId: actor.id,
            eventType: "customer.duplicate_phone_detected",
            targetType: "customer",
            targetId: existing.id,
            details: {
                phone,
                attempted_name: result.data.name,
            },
        });

        return {
            success: false,
            message: "Customer with this phone number already exists.",
        };
    }

    const { data, error } = await admin
        .from("customers")
        .insert({
            name: result.data.name,
            phone,
            email: result.data.email || null,
            address: result.data.address || null,
            notes: result.data.notes || null,
            tags: parseTags(result.data.tags),
            created_by: actor.id,
            last_seen_at: new Date().toISOString(),
        })
        .select("id")
        .single();

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    await logActivity({
        actorId: actor.id,
        eventType: "customer.created",
        targetType: "customer",
        targetId: data.id,
        details: {
            name: result.data.name,
            phone,
        },
    });

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

    const result = customerSchema.extend({
        id: z.string().uuid(),
    }).safeParse({
        id: formData.get("id"),
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        notes: formData.get("notes"),
        tags: formData.get("tags"),
    });

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
        };
    }

    const phone = normalizePhone(result.data.phone);
    const admin = createAdminClient();

    const { data: existing } = await admin
        .from("customers")
        .select("id")
        .eq("phone", phone)
        .neq("id", result.data.id)
        .maybeSingle();

    if (existing) {
        return {
            success: false,
            message: "Another customer already has this phone number.",
        };
    }

    const { error } = await admin
        .from("customers")
        .update({
            name: result.data.name,
            phone,
            email: result.data.email || null,
            address: result.data.address || null,
            notes: result.data.notes || null,
            tags: parseTags(result.data.tags),
            last_seen_at: new Date().toISOString(),
        })
        .eq("id", result.data.id);

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    await logActivity({
        actorId: actor.id,
        eventType: "customer.updated",
        targetType: "customer",
        targetId: result.data.id,
        details: {
            name: result.data.name,
            phone,
        },
    });

    revalidatePath("/crm/customers");
    revalidatePath(`/crm/customers/${result.data.id}`);

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

    const { data: customer } = await admin
        .from("customers")
        .select("name, phone")
        .eq("id", customerId)
        .maybeSingle();

    const { error } = await admin
        .from("customers")
        .delete()
        .eq("id", customerId);

    if (error) {
        return;
    }

    await logActivity({
        actorId: actor.id,
        eventType: "customer.deleted",
        targetType: "customer",
        targetId: customerId,
        details: {
            name: customer?.name,
            phone: customer?.phone,
        },
    });

    revalidatePath("/crm/customers");
}