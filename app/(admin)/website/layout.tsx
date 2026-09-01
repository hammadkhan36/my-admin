import { requirePermission } from "@/lib/auth/server";

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("pages.view");

  return children;
}