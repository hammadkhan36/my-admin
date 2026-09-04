import { requirePermission } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import {
  FormsManager,
  type CustomFormRow,
  type FormSubmissionRow,
} from "@/components/website/forms-manager";

export default async function FormsPage() {
  await requirePermission("forms.view");

  const supabase = await createClient();

  const [
    { data: forms, error: formsError },
    { data: submissions, error: submissionsError },
  ] = await Promise.all([
    supabase
      .from("custom_forms")
      .select("id, name, slug, description, fields, is_active, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("form_submissions")
      .select(
        "id, form_slug, customer_name, customer_phone, customer_email, data, source, page_url, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (formsError) throw new Error(formsError.message);
  if (submissionsError) throw new Error(submissionsError.message);

  return (
    <FormsManager
      forms={(forms ?? []) as CustomFormRow[]}
      submissions={(submissions ?? []) as FormSubmissionRow[]}
    />
  );
}