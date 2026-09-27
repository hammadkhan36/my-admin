import { requirePermission } from "@/lib/auth/server";
import { CreateRecordForm } from "@/components/contacts/create-record-form";
export default async function Page() {
  await requirePermission("leads.create");
  return <div className="space-y-5 p-6"><h1 className="text-2xl font-semibold">Create lead</h1><CreateRecordForm kind="lead" /></div>;
}
