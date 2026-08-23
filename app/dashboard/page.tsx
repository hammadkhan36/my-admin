// import { AppSidebar } from "@/components/app-sidebar"
// import { ChartAreaInteractive } from "@/components/chart-area-interactive"
// import { DataTable } from "@/components/data-table"
// import { SectionCards } from "@/components/section-cards"
// import { SiteHeader } from "@/components/site-header"
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// import data from "./data.json"

// export default function Page() {
//   return (
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "calc(var(--spacing) * 72)",
//           "--header-height": "calc(var(--spacing) * 12)",
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="flex flex-1 flex-col">
//           <div className="@container/main flex flex-1 flex-col gap-2">
//             <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//               <SectionCards />
//               <div className="px-4 lg:px-6">
//                 <ChartAreaInteractive />
//               </div>
//               <DataTable data={data} />
//             </div>
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }











import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LeadsOverviewChart } from "@/components/dashboard/leads-overview-chart";
import { LeadSourcesChart } from "@/components/dashboard/lead-sources-chart";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { TopServices } from "@/components/dashboard/top-services";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}