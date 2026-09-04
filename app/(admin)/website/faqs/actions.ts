"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-log";
import {
  actionFailure,
  actionSuccess,
  getErrorMessage,
  type ActionState,
} from "@/lib/action-state";


export async function createFaq(formData: FormData) {
  await requirePermission("faqs.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);

  if (!question || !answer) {
    throw new Error("Question and answer are required.");
  }

  const { data, error } = await supabase
    .from("faqs")
    .insert({
      question,
      answer,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      created_by: profile.id,
    })
    .select("id, question")
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "faq.created",
    targetType: "faq",
    targetId: data.id,
    details: { question: data.question },
  });

  revalidatePath("/website/faqs");
}

export async function updateFaq(formData: FormData) {
  await requirePermission("faqs.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!id || !question || !answer) {
    throw new Error("FAQ id, question and answer are required.");
  }

  const { error } = await supabase
    .from("faqs")
    .update({
      question,
      answer,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "faq.updated",
    targetType: "faq",
    targetId: id,
    details: { question },
  });

  revalidatePath("/website/faqs");
}

export async function deleteFaq(formData: FormData) {
  await requirePermission("faqs.manage");

  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  const question = String(formData.get("question") || "FAQ");

  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await logActivity({
    actorId: profile.id,
    eventType: "faq.deleted",
    targetType: "faq",
    targetId: id,
    details: { question },
  });

  revalidatePath("/website/faqs");
}






export async function createFaqSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await createFaq(formData);
    return actionSuccess("FAQ created successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "FAQ could not be created."));
  }
}

export async function updateFaqSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await updateFaq(formData);
    return actionSuccess("FAQ updated successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "FAQ could not be updated."));
  }
}

export async function deleteFaqSafe(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await deleteFaq(formData);
    return actionSuccess("FAQ deleted successfully.");
  } catch (error) {
    return actionFailure(getErrorMessage(error, "FAQ could not be deleted."));
  }
}