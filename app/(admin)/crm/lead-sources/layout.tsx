import { requirePermission } from "@/lib/auth/server";

export default async function LeadSourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("leadSources.view");

  return children;
}