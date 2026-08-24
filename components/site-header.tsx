// // // import { Separator } from "@/components/ui/separator"
// // // import { SidebarTrigger } from "@/components/ui/sidebar"

// // // export function SiteHeader() {
// // //   return (
// // //     <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
// // //       <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
// // //         <SidebarTrigger className="-ml-1" />
// // //         <Separator
// // //           orientation="vertical"
// // //           className="mx-2 h-4 data-vertical:self-auto"
// // //         />
// // //         <h1 className="text-base font-medium">Documents</h1>
// // //       </div>
// // //     </header>
// // //   )
// // // }






// // import { Separator } from "@/components/ui/separator";
// // import { SidebarTrigger } from "@/components/ui/sidebar";
// // import { ThemeToggle } from "@/components/theme-toggle";

// // export function SiteHeader() {
// //   return (
// //     <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
// //       <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
// //         <SidebarTrigger className="-ml-1" />
// //         <Separator
// //           orientation="vertical"
// //           className="mx-2 h-4 data-vertical:self-auto"
// //         />
// //         <h1 className="text-base font-semibold tracking-tight flex items-center gap-2">
// //           <span className="h-2 w-2 rounded-full  bg-emerald-500 animate-pulse"></span>
// //           Dashboard
// //         </h1>
// //         <div className="ml-auto flex items-center gap-2">
// //           <ThemeToggle />
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }










// import { Separator } from "@/components/ui/separator";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { ThemeToggle } from "@/components/theme-toggle";
// import { siteConfig } from "@/lib/site-config";
// import Image from "next/image";

// export function SiteHeader() {
//   return (
//     <header className="sticky top-0 z-30 flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-xl transition-[width,height] ease-linear">
//       <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
//         <SidebarTrigger className="-ml-1" />
//         <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />

//         {/* Logo + Name (optional) */}
//         <div className="flex items-center gap-2">
//           {/* {siteConfig.logo && (
//             <Image src={siteConfig.logo} alt={siteConfig.shortName} width={28} height={28} className="rounded" />
//           )} */}
//           <h1 className="text-base font-semibold tracking-tight flex items-center gap-2">
//             <span className="relative flex h-2.5 w-2.5">
//               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
//               <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
//             </span>
//             Dashboard
//           </h1>
//         </div>

//         <div className="ml-auto flex items-center gap-2">
//           <ThemeToggle />
//         </div>
//       </div>
//     </header>
//   );
// }




// after supabase integation code

"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSupabaseConfig } from "@/components/supabase-config-provider";

export function SiteHeader() {
  const { businessSettings } = useSupabaseConfig();
  const businessName = businessSettings?.short_name || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <h1 className="text-base font-semibold tracking-tight">{businessName}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}