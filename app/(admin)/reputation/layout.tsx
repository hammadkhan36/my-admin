import { requirePermission } from "@/lib/auth/server";

export default async function ReputationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("reviews.view");

  return children;
}