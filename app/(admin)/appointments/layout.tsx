import { requirePermission } from "@/lib/auth/server";
import { requireFeatureEnabled } from "@/lib/features/server";

export default async function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("appointments.view");
  await requireFeatureEnabled("appointments");

  return children;
}