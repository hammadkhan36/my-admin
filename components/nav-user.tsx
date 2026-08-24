// "use client"

// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar"
// import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"

// export function NavUser({
//   user,
// }: {
//   user: {
//     name: string
//     email: string
//     avatar: string
//     Role: string
//   }
// }) {
//   const { isMobile } = useSidebar()
//   return (
//     <SidebarMenu>
//       <SidebarMenuItem>
//         <DropdownMenu>
//           <DropdownMenuTrigger
//             render={
//               <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
//             }
//           >
//             <Avatar className="size-8 rounded-lg grayscale">
//               <AvatarImage src={user.avatar} alt={user.name} />
//               <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//             </Avatar>
//             <div className="grid flex-1 text-left text-sm leading-tight">
//               {/* <span className="truncate font-normal text-xs">{user.Role}</span> */}
//               <span className="truncate font-medium">{user.name}  {' '}
//                 <span className="ml-1 text-[12px] font-normal text-muted-foreground/70">({user.Role})</span> </span>
//               <span className="truncate text-xs text-foreground/70">
//                 {user.email}
//               </span>
//             </div>
//             <EllipsisVerticalIcon className="ml-auto size-4" />
//           </DropdownMenuTrigger>
//           <DropdownMenuContent
//             className="min-w-56"
//             side={isMobile ? "bottom" : "right"}
//             align="end"
//             sideOffset={4}
//           >
//             <DropdownMenuGroup>
//               <DropdownMenuLabel className="p-0 font-normal">
//                 <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                   <Avatar className="size-8">
//                     <AvatarImage src={user.avatar} alt={user.name} />
//                     <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//                   </Avatar>
//                   <div className="grid flex-1 text-left text-sm leading-tight">
//                     <span className="truncate font-medium">{user.name}</span>
//                     <span className="truncate text-xs text-muted-foreground">
//                       {user.email}
//                     </span>
//                   </div>
//                 </div>
//               </DropdownMenuLabel>
//             </DropdownMenuGroup>
//             <DropdownMenuSeparator />
//             <DropdownMenuGroup>
//               <DropdownMenuItem>
//                 <CircleUserRoundIcon
//                 />
//                 Account
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <CreditCardIcon
//                 />
//                 Billing
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <BellIcon
//                 />
//                 Notifications
//               </DropdownMenuItem>
//             </DropdownMenuGroup>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>
//               <LogOutIcon
//               />
//               Log out
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </SidebarMenuItem>
//     </SidebarMenu>
//   )
// }







"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, User, LogOut } from "lucide-react";

export function NavUser({ user }: { user: { name: string; email: string; avatar: string; Role?: string } }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        }
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/system/notifications")}>
          <Bell className="mr-2 h-4 w-4" /> Notifications
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/system/settings")}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}