import { requirePermission } from "@/lib/auth/server";

export default async function FollowUpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("followUps.view");

  return children;
}