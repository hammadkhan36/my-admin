



import Link from "next/link";
import { Download } from "lucide-react";
import { requirePermission } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  await requirePermission("reports.export");

  const reports = [
    {
      title: "Leads Report",
      description: "Export lead names, phone numbers, sources, statuses and tracking data.",
      type: "leads",
    },
    {
      title: "Customers Report",
      description: "Export customer contact details, tags and last seen dates.",
      type: "customers",
    },
    {
      title: "Appointments Report",
      description: "Export appointment date, time, status, source and notes.",
      type: "appointments",
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Download business data as CSV files.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <CardTitle className="text-base">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.description}</p>

              <Link
                href={`/api/reports/export?type=${report.type}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}