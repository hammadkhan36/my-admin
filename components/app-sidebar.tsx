// "use client"

// import * as React from "react"
// import Link from "next/link"
// import Image from "next/image"
// import { usePathname } from "next/navigation"  // <-- Dynamic active state ke liye
// import { siteConfig } from "@/lib/site-config"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarGroupContent,
// } from "@/components/ui/sidebar"
// import { NavUser } from "@/components/nav-user"
// import {
//   LayoutDashboardIcon,
//   UsersIcon,
//   UserIcon,
//   MegaphoneIcon,
//   TagIcon,
//   TicketIcon,
//   Share2Icon,
//   StarIcon,
//   MessageSquareIcon,
//   ImageIcon,
//   WrenchIcon,
//   PackageIcon,
//   FileTextIcon,
//   HelpCircleIcon,
//   FileImageIcon,
//   SearchIcon,
//   BarChartIcon,
//   TrendingUpIcon,
//   FileBarChartIcon,
//   BuildingIcon,
//   MapPinIcon,
//   ClockIcon,
//   Users2Icon,
//   ShieldIcon,
//   BellIcon,
//   HistoryIcon,
//   SettingsIcon,
//   CommandIcon,
// } from "lucide-react"

// // Menu structure
// const menuGroups = [
//   {
//     label: "Overview",
//     items: [
//       { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
//     ],
//   },
//   {
//     label: "CRM",
//     items: [
//       { title: "Leads", url: "/crm/leads", icon: UsersIcon },
//       { title: "Customers", url: "/crm/customers", icon: UserIcon },
//       { title: "Notifications", url: "/crm/notifications", icon: BellIcon },
//     ],
//   },
//   {
//     label: "Marketing",
//     items: [
//       { title: "Campaigns", url: "/marketing/campaigns", icon: MegaphoneIcon },
//       { title: "Offers", url: "/marketing/offers", icon: TagIcon },
//       { title: "Coupons", url: "/marketing/coupons", icon: TicketIcon },
//       { title: "Referrals", url: "/marketing/referrals", icon: Share2Icon },
//     ],
//   },
//   {
//     label: "Reputation",
//     items: [
//       { title: "Reviews", url: "/reputation/reviews", icon: StarIcon },
//       { title: "Testimonials", url: "/reputation/testimonials", icon: MessageSquareIcon },
//       { title: "Customer Gallery", url: "/reputation/gallery", icon: ImageIcon },
//     ],
//   },
//   {
//     label: "Website",
//     items: [
//       { title: "Services", url: "/website/services", icon: WrenchIcon },
//       { title: "Products", url: "/website/products", icon: PackageIcon },
//       { title: "Pages", url: "/website/pages", icon: FileTextIcon },
//       { title: "FAQs", url: "/website/faqs", icon: HelpCircleIcon },
//       { title: "Media", url: "/website/media", icon: FileImageIcon },
//       { title: "SEO", url: "/website/seo", icon: SearchIcon },
//     ],
//   },
//   {
//     label: "Analytics",
//     items: [
//       { title: "Analytics", url: "/analytics", icon: BarChartIcon,  exact: true},
//       { title: "Traffic Sources", url: "/analytics/traffic-sources", icon: TrendingUpIcon },
//       { title: "Reports", url: "/analytics/reports", icon: FileBarChartIcon },
//     ],
//   },
//   {
//     label: "Business",
//     items: [
//       { title: "Business Profile", url: "/business/profile", icon: BuildingIcon },
//       { title: "Service Areas", url: "/business/service-areas", icon: MapPinIcon },
//       { title: "Business Hours", url: "/business/hours", icon: ClockIcon },
//     ],
//   },
//   {
//     label: "Team",
//     items: [
//       { title: "Staff", url: "/team/staff", icon: Users2Icon },
//       { title: "Roles & Permissions", url: "/team/roles", icon: ShieldIcon },
//     ],
//   },
//   {
//     label: "System",
//     items: [
//       { title: "Notifications Settings", url: "/system/notifications", icon: BellIcon },
//       { title: "Activity Logs", url: "/system/activity-logs", icon: HistoryIcon },
//       { title: "Settings", url: "/system/settings", icon: SettingsIcon },
//     ],
//   },
// ]

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const pathname = usePathname()  // <-- Current pathname

//   return (
//     <Sidebar collapsible="offcanvas" {...props}>
//       {/* Header with logo */}
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               className="data-[slot=sidebar-menu-button]:p-1.5!"
//               render={<Link href="/dashboard" />}
//             >
//               {siteConfig.logo ? (
//                 <Image
//                   src={siteConfig.logo}
//                   alt={siteConfig.name}
//                   width={24}
//                   height={24}
//                   className="size-5 rounded"
//                 />
//               ) : (
//                 <CommandIcon className="size-5!" />
//               )}
//               <span className="text-base font-semibold">{siteConfig.shortName}</span>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       {/* Content with grouped menu */}
//       <SidebarContent>
//         {menuGroups.map((group) => (
//           <SidebarGroup key={group.label}>
//             <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {group.items.map((item) => {
//                   const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
//                   return (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton
//                         render={<Link href={item.url} />}
//                         isActive={isActive}  // <-- Dynamic active state
//                       >
//                         <item.icon className="size-4" />
//                         <span>{item.title}</span>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   )
//                 })}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>

//       {/* Footer with user */}
//       <SidebarFooter>
//         <NavUser
//           user={{
//             name: siteConfig.user,
//             email: siteConfig.userEmail,
//             avatar: siteConfig.userAvatar,
//             Role: siteConfig.userRole,
//           }}
//         />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }





"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/lib/site-config"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import {
  LayoutDashboardIcon,
  UsersIcon,
  UserIcon,
  MegaphoneIcon,
  TagIcon,
  TicketIcon,
  Share2Icon,
  StarIcon,
  MessageSquareIcon,
  ImageIcon,
  WrenchIcon,
  PackageIcon,
  FileTextIcon,
  HelpCircleIcon,
  FileImageIcon,
  SearchIcon,
  BarChartIcon,
  TrendingUpIcon,
  FileBarChartIcon,
  BuildingIcon,
  MapPinIcon,
  ClockIcon,
  Users2Icon,
  ShieldIcon,
  BellIcon,
  HistoryIcon,
  SettingsIcon,
  CommandIcon,
  CalendarDays,
  CalendarCheck,
  Scissors,
  Clock,
} from "lucide-react"

// Menu structure with exact flag for items that should not highlight on subroutes
const menuGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
    ],
  },
  {
    label: "CRM",
    items: [
      { title: "Leads", url: "/crm/leads", icon: UsersIcon },
      { title: "Customers", url: "/crm/customers", icon: UserIcon },
      { title: "Notifications", url: "/crm/notifications", icon: BellIcon },
    ],
  },
  {
    label: "APPOINTMENTS",
    items: [
      { title: "Appointments", url: "/appointments", icon: CalendarDays,  exact: true },
      { title: "Calendar", url: "/appointments/calendar", icon: CalendarCheck },
      { title: "Services", url: "/appointments/services", icon: Scissors },
      { title: "Availability", url: "/appointments/availability", icon: Clock },
    ],
  },
  {
    label: "Marketing",
    items: [
      { title: "Campaigns", url: "/marketing/campaigns", icon: MegaphoneIcon },
      { title: "Offers", url: "/marketing/offers", icon: TagIcon },
      { title: "Coupons", url: "/marketing/coupons", icon: TicketIcon },
      { title: "Referrals", url: "/marketing/referrals", icon: Share2Icon },
    ],
  },
  {
    label: "Reputation",
    items: [
      { title: "Reviews", url: "/reputation/reviews", icon: StarIcon },
      { title: "Testimonials", url: "/reputation/testimonials", icon: MessageSquareIcon },
      { title: "Customer Gallery", url: "/reputation/gallery", icon: ImageIcon },
    ],
  },
  {
    label: "Website",
    items: [
      { title: "Services", url: "/website/services", icon: WrenchIcon },
      { title: "Products", url: "/website/products", icon: PackageIcon },
      { title: "Pages", url: "/website/pages", icon: FileTextIcon },
      { title: "FAQs", url: "/website/faqs", icon: HelpCircleIcon },
      { title: "Media", url: "/website/media", icon: FileImageIcon },
      { title: "SEO", url: "/website/seo", icon: SearchIcon },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Analytics", url: "/analytics", icon: BarChartIcon, exact: true }, // <-- exact flag
      { title: "Traffic Sources", url: "/analytics/traffic-sources", icon: TrendingUpIcon },
      { title: "Reports", url: "/analytics/reports", icon: FileBarChartIcon },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Business Profile", url: "/business/profile", icon: BuildingIcon },
      { title: "Service Areas", url: "/business/service-areas", icon: MapPinIcon },
      { title: "Business Hours", url: "/business/hours", icon: ClockIcon },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Staff", url: "/team/staff", icon: Users2Icon },
      { title: "Roles & Permissions", url: "/team/roles", icon: ShieldIcon },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications Settings", url: "/system/notifications", icon: BellIcon },
      { title: "Activity Logs", url: "/system/activity-logs", icon: HistoryIcon },
      { title: "Settings", url: "/system/settings", icon: SettingsIcon },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              {siteConfig.logo ? (
                <Image
                  src={siteConfig.logo}
                  alt={siteConfig.name}
                  width={24}
                  height={24}
                  className="size-5 rounded"
                />
              ) : (
                <CommandIcon className="size-5!" />
              )}
              <span className="text-base font-semibold">{siteConfig.shortName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Decide active state based on exact flag
                  const isActive = item.exact
                    ? pathname === item.url
                    : pathname === item.url || pathname.startsWith(item.url + "/")
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: siteConfig.user,
            email: siteConfig.userEmail,
            avatar: siteConfig.userAvatar,
            Role: siteConfig.userRole,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}