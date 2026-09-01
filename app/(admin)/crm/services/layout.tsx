import { requirePermission } from "@/lib/auth/server";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("services.view");

  return children;
}