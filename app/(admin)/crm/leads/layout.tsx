import { requirePermission } from "@/lib/auth/server";

export default async function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("leads.view");

  return children;
}