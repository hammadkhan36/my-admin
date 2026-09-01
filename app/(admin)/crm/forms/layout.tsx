import { requirePermission } from "@/lib/auth/server";

export default async function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("forms.view");

  return children;
}