// app/(dashboard)/dashboard/page.tsx
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LeadsOverviewChart } from "@/components/dashboard/leads-overview-chart";
import { LeadSourcesChart } from "@/components/dashboard/lead-sources-chart";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { TopServices } from "@/components/dashboard/top-services";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* Header + Date Range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <p className="text-muted-foreground">Monitor your business performance</p>
          </div>
          <DateRangeFilter />
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <LeadsOverviewChart />
          </div>
          <LeadSourcesChart />
        </div>

        {/* Conversion Funnel & Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ConversionFunnel />
          <TopServices />
        </div>

        {/* Recent Leads & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentLeads />
          </div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}