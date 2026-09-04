"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseFields(value: string) {
  const fields = value
    .split("\n")
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field) => {
      const [label = "", type = "text", required = "false"] = field.split("|");

      return {
        label: label.trim(),
        name: slugify(label),
        type: type.trim() || "text",
        required: required.trim().toLowerCase() === "true",
      };
    });

  return fields;
}

export async function createCustomForm(formData: FormData) {
  await requirePermission("forms.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const description = String(formData.get("description") || "").trim() || null;
  const fieldsText = String(formData.get("fields") || "");

  if (!name || !slug) {
    throw new Error("Form name and slug are required.");
  }

  const { data, error } = await supabase
    .from("custom_forms")
    .insert({
      name,
      slug,
      description,
      fields: parseFields(fieldsText),
      created_by: profile.id,
    })
    .select("id, name, slug")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "form.created",
    targetType: "form",
    targetId: data.id,
    details: { name: data.name, slug: data.slug },
  });

  revalidatePath("/website/forms");
}

export async function updateCustomForm(formData: FormData) {
  await requirePermission("forms.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));
  const description = String(formData.get("description") || "").trim() || null;
  const fieldsText = String(formData.get("fields") || "");
  const isActive = formData.get("is_active") === "on";

  if (!id || !name || !slug) {
    throw new Error("Form id, name and slug are required.");
  }

  const { error } = await supabase
    .from("custom_forms")
    .update({
      name,
      slug,
      description,
      fields: parseFields(fieldsText),
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "form.updated",
    targetType: "form",
    targetId: id,
    details: { name, slug },
  });

  revalidatePath("/website/forms");
}

export async function deleteCustomForm(formData: FormData) {
  await requirePermission("forms.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "Form");

  const { error } = await supabase.from("custom_forms").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "form.deleted",
    targetType: "form",
    targetId: id,
    details: { name },
  });

  revalidatePath("/website/forms");
}



export async function deleteFormSubmission(formData: FormData) {
  await requirePermission("forms.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const formSlug = String(formData.get("form_slug") || "form");

  if (!id) {
    throw new Error("Submission id is required.");
  }

  const { error } = await supabase
    .from("form_submissions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "form.submission_deleted",
    targetType: "form_submission",
    targetId: id,
    details: { form_slug: formSlug },
  });

  revalidatePath("/website/forms");
}