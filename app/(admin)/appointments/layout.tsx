import { requirePermission } from "@/lib/auth/server";

export default async function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("appointments.view");

  return children;
}