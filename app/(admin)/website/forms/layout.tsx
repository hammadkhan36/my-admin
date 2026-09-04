import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFeatureEnabled("forms");
  await requirePermission("forms.view");

  return children;
}