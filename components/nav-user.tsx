// // // // "use client"

// // // // import {
// // // //   Avatar,
// // // //   AvatarFallback,
// // // //   AvatarImage,
// // // // } from "@/components/ui/avatar"
// // // // import {
// // // //   DropdownMenu,
// // // //   DropdownMenuContent,
// // // //   DropdownMenuGroup,
// // // //   DropdownMenuItem,
// // // //   DropdownMenuLabel,
// // // //   DropdownMenuSeparator,
// // // //   DropdownMenuTrigger,
// // // // } from "@/components/ui/dropdown-menu"
// // // // import {
// // // //   SidebarMenu,
// // // //   SidebarMenuButton,
// // // //   SidebarMenuItem,
// // // //   useSidebar,
// // // // } from "@/components/ui/sidebar"
// // // // import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"

// // // // export function NavUser({
// // // //   user,
// // // // }: {
// // // //   user: {
// // // //     name: string
// // // //     email: string
// // // //     avatar: string
// // // //     Role: string
// // // //   }
// // // // }) {
// // // //   const { isMobile } = useSidebar()
// // // //   return (
// // // //     <SidebarMenu>
// // // //       <SidebarMenuItem>
// // // //         <DropdownMenu>
// // // //           <DropdownMenuTrigger
// // // //             render={
// // // //               <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
// // // //             }
// // // //           >
// // // //             <Avatar className="size-8 rounded-lg grayscale">
// // // //               <AvatarImage src={user.avatar} alt={user.name} />
// // // //               <AvatarFallback className="rounded-lg">CN</AvatarFallback>
// // // //             </Avatar>
// // // //             <div className="grid flex-1 text-left text-sm leading-tight">
// // // //               {/* <span className="truncate font-normal text-xs">{user.Role}</span> */}
// // // //               <span className="truncate font-medium">{user.name}  {' '}
// // // //                 <span className="ml-1 text-[12px] font-normal text-muted-foreground/70">({user.Role})</span> </span>
// // // //               <span className="truncate text-xs text-foreground/70">
// // // //                 {user.email}
// // // //               </span>
// // // //             </div>
// // // //             <EllipsisVerticalIcon className="ml-auto size-4" />
// // // //           </DropdownMenuTrigger>
// // // //           <DropdownMenuContent
// // // //             className="min-w-56"
// // // //             side={isMobile ? "bottom" : "right"}
// // // //             align="end"
// // // //             sideOffset={4}
// // // //           >
// // // //             <DropdownMenuGroup>
// // // //               <DropdownMenuLabel className="p-0 font-normal">
// // // //                 <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
// // // //                   <Avatar className="size-8">
// // // //                     <AvatarImage src={user.avatar} alt={user.name} />
// // // //                     <AvatarFallback className="rounded-lg">CN</AvatarFallback>
// // // //                   </Avatar>
// // // //                   <div className="grid flex-1 text-left text-sm leading-tight">
// // // //                     <span className="truncate font-medium">{user.name}</span>
// // // //                     <span className="truncate text-xs text-muted-foreground">
// // // //                       {user.email}
// // // //                     </span>
// // // //                   </div>
// // // //                 </div>
// // // //               </DropdownMenuLabel>
// // // //             </DropdownMenuGroup>
// // // //             <DropdownMenuSeparator />
// // // //             <DropdownMenuGroup>
// // // //               <DropdownMenuItem>
// // // //                 <CircleUserRoundIcon
// // // //                 />
// // // //                 Account
// // // //               </DropdownMenuItem>
// // // //               <DropdownMenuItem>
// // // //                 <CreditCardIcon
// // // //                 />
// // // //                 Billing
// // // //               </DropdownMenuItem>
// // // //               <DropdownMenuItem>
// // // //                 <BellIcon
// // // //                 />
// // // //                 Notifications
// // // //               </DropdownMenuItem>
// // // //             </DropdownMenuGroup>
// // // //             <DropdownMenuSeparator />
// // // //             <DropdownMenuItem>
// // // //               <LogOutIcon
// // // //               />
// // // //               Log out
// // // //             </DropdownMenuItem>
// // // //           </DropdownMenuContent>
// // // //         </DropdownMenu>
// // // //       </SidebarMenuItem>
// // // //     </SidebarMenu>
// // // //   )
// // // // }







// // // "use client";

// // // import * as React from "react";
// // // import Link from "next/link";
// // // import { useRouter } from "next/navigation";
// // // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// // // import {
// // //   DropdownMenu,
// // //   DropdownMenuContent,
// // //   DropdownMenuItem,
// // //   DropdownMenuLabel,
// // //   DropdownMenuSeparator,
// // //   DropdownMenuTrigger,
// // // } from "@/components/ui/dropdown-menu";
// // // import { Bell, Settings, User, LogOut } from "lucide-react";

// // // export function NavUser({ user }: { user: { name: string; email: string; avatar: string; Role?: string } }) {
// // //   const router = useRouter();

// // //   return (
// // //     <DropdownMenu>
// // //       <DropdownMenuTrigger
// // //         render={
// // //           <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
// // //         }
// // //       >
// // //         <Avatar className="h-8 w-8">
// // //           <AvatarImage src={user.avatar} />
// // //           <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
// // //         </Avatar>
// // //         <div className="flex-1 text-left">
// // //           <p className="text-sm font-medium">{user.name}</p>
// // //           <p className="text-xs text-muted-foreground">{user.email}</p>
// // //         </div>
// // //       </DropdownMenuTrigger>
// // //       <DropdownMenuContent align="start" className="w-56">
// // //         <DropdownMenuLabel>My Account</DropdownMenuLabel>
// // //         <DropdownMenuSeparator />
// // //         <DropdownMenuItem onSelect={() => router.push("/profile")}>
// // //           <User className="mr-2 h-4 w-4" /> Profile
// // //         </DropdownMenuItem>
// // //         <DropdownMenuItem onSelect={() => router.push("/system/notifications")}>
// // //           <Bell className="mr-2 h-4 w-4" /> Notifications
// // //         </DropdownMenuItem>
// // //         <DropdownMenuItem onSelect={() => router.push("/system/settings")}>
// // //           <Settings className="mr-2 h-4 w-4" /> Settings
// // //         </DropdownMenuItem>
// // //         <DropdownMenuSeparator />
// // //         <DropdownMenuItem className="text-red-500">
// // //           <LogOut className="mr-2 h-4 w-4" /> Logout
// // //         </DropdownMenuItem>
// // //       </DropdownMenuContent>
// // //     </DropdownMenu>
// // //   );
// // // }











// // // new code after supabase integration

// // "use client";

// // import * as React from "react";
// // import Link from "next/link";
// // import { useRouter } from "next/navigation";
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuLabel,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import { Bell, Settings, User, LogOut } from "lucide-react";
// // import { createClient } from "@/lib/supabase-browser";

// // export function NavUser() {
// //   const router = useRouter();
// //   const supabase = createClient();
// //   const [profile, setProfile] = React.useState<{ full_name?: string; email?: string; avatar_url?: string } | null>(null);

// //   React.useEffect(() => {
// //     const fetchProfile = async () => {
// //       const { data: { user } } = await supabase.auth.getUser();
// //       if (user) {
// //         const { data: prof } = await supabase
// //           .from("profiles")
// //           .select("full_name, email, avatar_url")
// //           .eq("id", user.id)
// //           .single();
// //         setProfile(prof || user);
// //       }
// //     };
// //     fetchProfile();
// //   }, []);

// //   const logout = async () => {
// //     await supabase.auth.signOut();
// //     router.push("/");
// //   };

// //   const name = profile?.full_name || profile?.email?.split("@")[0] || "User";
// //   const email = profile?.email || "";
// //   const avatar = profile?.avatar_url || "";

// //   return (
// //     <DropdownMenu>
// //       <DropdownMenuTrigger
// //         render={
// //           <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
// //         }
// //       >
// //         <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
// //           <Avatar className="h-8 w-8">
// //             {avatar && <AvatarImage src={avatar} />}
// //             <AvatarFallback>{name.charAt(0)}</AvatarFallback>
// //           </Avatar>
// //           <div className="flex-1 text-left">
// //             <p className="text-sm font-medium">{name}</p>
// //             <p className="text-xs text-muted-foreground">{email}</p>
// //           </div>
// //         </button>
// //       </DropdownMenuTrigger>
// //       <DropdownMenuContent align="start" className="w-56">
// //         <DropdownMenuLabel>My Account</DropdownMenuLabel>
// //         <DropdownMenuSeparator />
// //         <DropdownMenuItem onSelect={() => router.push("/profile")}>
// //           <User className="mr-2 h-4 w-4" /> Profile
// //         </DropdownMenuItem>
// //         <DropdownMenuItem onSelect={() => router.push("/crm/notifications")}>
// //           <Bell className="mr-2 h-4 w-4" /> Notifications
// //         </DropdownMenuItem>
// //         <DropdownMenuItem onSelect={() => router.push("/system/settings")}>
// //           <Settings className="mr-2 h-4 w-4" /> Settings
// //         </DropdownMenuItem>
// //         <DropdownMenuSeparator />
// //         <DropdownMenuItem className="text-red-500" onSelect={logout}>
// //           <LogOut className="mr-2 h-4 w-4" /> Logout
// //         </DropdownMenuItem>
// //       </DropdownMenuContent>
// //     </DropdownMenu>
// //   );
// // }











// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Bell, Settings, User, LogOut } from "lucide-react";
// import { createClient } from "@/lib/supabase-browser";

// export function NavUser() {
//   const router = useRouter();
//   const supabase = createClient();
//   const [profile, setProfile] = React.useState<{ full_name?: string; email?: string; avatar_url?: string } | null>(null);

//   React.useEffect(() => {
//     const fetchProfile = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         const { data: prof } = await supabase
//           .from("profiles")
//           .select("full_name, email, avatar_url")
//           .eq("id", user.id)
//           .single();
//         setProfile(prof || user);
//       }
//     };
//     fetchProfile();
//   }, []);

//   const logout = async () => {
//     await supabase.auth.signOut();
//     router.push("/");
//   };

//   const name = profile?.full_name || profile?.email?.split("@")[0] || "User";
//   const email = profile?.email || "";
//   const avatar = profile?.avatar_url || "";

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger
//         render={
//           <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
//         }
//       >
//         {/* ✅ No nested button – just the content */}
//         <Avatar className="h-8 w-8">
//           {avatar && <AvatarImage src={avatar} />}
//           <AvatarFallback>{name.charAt(0)}</AvatarFallback>
//         </Avatar>
//         <div className="flex-1 text-left">
//           <p className="text-sm font-medium">{name}</p>
//           <p className="text-xs text-muted-foreground">{email}</p>
//         </div>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="start" className="w-56">
//         <DropdownMenuLabel>My Account</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onSelect={() => router.push("/profile")}>
//           <User className="mr-2 h-4 w-4" /> Profile
//         </DropdownMenuItem>
//         <DropdownMenuItem onSelect={() => router.push("/crm/notifications")}>
//           <Bell className="mr-2 h-4 w-4" /> Notifications
//         </DropdownMenuItem>
//         <DropdownMenuItem onSelect={() => router.push("/system/settings")}>
//           <Settings className="mr-2 h-4 w-4" /> Settings
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem className="text-red-500" onSelect={logout}>
//           <LogOut className="mr-2 h-4 w-4" /> Logout
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
















// "use client";

// import { useRouter } from "next/navigation";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuGroup,
// } from "@/components/ui/dropdown-menu";
// import { Bell, LogOut, Settings, ShieldCheck, User } from "lucide-react";
// import { createClient } from "@/lib/supabase-browser";
// import { useAuth } from "@/components/auth-provider";

// export function NavUser() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { profile } = useAuth();

//   const name = profile.full_name || profile.email.split("@")[0] || "User";
//   const email = profile.email;
//   const avatar = profile.avatar_url || "";
//   const isSuperAdmin = profile.role === "superadmin";

//   const logout = async () => {
//     await supabase.auth.signOut();
//     router.replace("/");
//     router.refresh();
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger
//         render={
//           <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
//         }
//       >
//         <Avatar className="h-8 w-8">
//           {avatar && <AvatarImage src={avatar} alt={name} />}
//           <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
//         </Avatar>

//         <div className="min-w-0 flex-1 text-left">
//           <p className="truncate text-sm font-medium">
//             {name}{" "}
//             <span className="text-[11px] font-normal capitalize text-muted-foreground/70">
//               ({profile.role})
//             </span>
//           </p>
//           <p className="truncate text-xs text-muted-foreground">{email}</p>
//         </div>
//       </DropdownMenuTrigger>



//       <DropdownMenuContent align="start" side="right" className="w-56">
//          <DropdownMenuGroup> 
//         <DropdownMenuLabel>My Account</DropdownMenuLabel>
//         <DropdownMenuSeparator />

//         <DropdownMenuItem onSelect={() => router.push("/profile")}>
//           <User className="mr-2 h-4 w-4" />
//           Profile
//         </DropdownMenuItem>

//         <DropdownMenuItem onSelect={() => router.push("/crm/notifications")}>
//           <Bell className="mr-2 h-4 w-4" />
//           Notifications
//         </DropdownMenuItem>

//         <DropdownMenuItem onSelect={() => router.push("/system/settings")}>
//           <Settings className="mr-2 h-4 w-4" />
//           Settings
//         </DropdownMenuItem>

//         {isSuperAdmin && (
//           <DropdownMenuItem onSelect={() => router.push("/super-admin/dashboard")}>
//             <ShieldCheck className="mr-2 h-4 w-4" />
//             Super Admin
//           </DropdownMenuItem>
//         )}
//          </DropdownMenuGroup>    

//         <DropdownMenuSeparator />

//         <DropdownMenuItem className="text-red-500" onSelect={logout}>
//           <LogOut className="mr-2 h-4 w-4" />
//           Log out
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }






"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, ShieldCheck, User } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth-provider";

export function NavUser() {
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useAuth();

  const name = profile.full_name || profile.email.split("@")[0] || "User";
  const email = profile.email;
  const avatar = profile.avatar_url || "";
  const isSuperAdmin = profile.role === "superadmin";

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8">
              {avatar && <AvatarImage src={avatar} alt={name} />}
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium">
                {name}{" "}
                <span className="text-[11px] font-normal capitalize text-muted-foreground/70">
                  ({profile.role})
                </span>
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </button>
        }
      />

      <DropdownMenuContent align="start" side="right" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* ✅ Use onClick instead of onSelect */}
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/crm/notifications")}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/system/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>

          {isSuperAdmin && (
            <DropdownMenuItem onClick={() => router.push("/super-admin/dashboard")}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Super Admin
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-500" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}