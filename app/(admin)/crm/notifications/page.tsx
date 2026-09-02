// "use client";

// import { notifications } from "@/lib/crm-data";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// export default function NotificationsPage() {
//   const [notifs, setNotifs] = useState(notifications);
//   const [activeCategory, setActiveCategory] = useState("all");

//   const filtered = activeCategory === "all"
//     ? notifs
//     : notifs.filter((n) => n.category === activeCategory);

//   const markRead = (id: string) => {
//     setNotifs(notifs.map((n) => n.id === id ? { ...n, read: true } : n));
//   };

//   const markAllRead = () => {
//     setNotifs(notifs.map((n) => ({ ...n, read: true })));
//   };

//   const categories = ["all", "Leads", "Reviews", "Marketing", "Customers", "System"];

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Notifications</h1>
//         <Button variant="outline" onClick={markAllRead}>Mark All Read</Button>
//       </div>

//       <Tabs value={activeCategory} onValueChange={setActiveCategory}>
//         <TabsList>
//           {categories.map((cat) => (
//             <TabsTrigger key={cat} value={cat}>{cat === "all" ? "All" : cat}</TabsTrigger>
//           ))}
//         </TabsList>

//         <div className="mt-4 space-y-2">
//           {filtered.map((notif) => (
//             <Card key={notif.id} className={notif.read ? "opacity-70" : ""}>
//               <CardContent className="flex items-start justify-between py-4">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <Badge variant="outline">{notif.category}</Badge>
//                     {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
//                   </div>
//                   <p className="font-medium mt-1">{notif.title}</p>
//                   <p className="text-sm text-muted-foreground">{notif.description}</p>
//                   <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
//                 </div>
//                 {!notif.read && (
//                   <Button variant="ghost" size="sm" onClick={() => markRead(notif.id)}>
//                     Mark Read
//                   </Button>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </Tabs>
//     </div>
//   );
// }






















import Link from "next/link";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(admin)/crm/notifications/actions";
import { requirePermission, requireProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NotificationRow = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  target_url: string | null;
  recipient_id: string | null;
  read_at: string | null;
  created_at: string;
};

export default async function NotificationsPage() {
  await requirePermission("notifications.view");
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("id, title, message, type, target_url, recipient_id, read_at, created_at")
    .or(`recipient_id.eq.${profile.id},recipient_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(100);

  const notifications = (data ?? []) as NotificationRow[];
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Updates for leads, customers, appointments and system actions.
          </p>
        </div>

        <form action={markAllNotificationsRead}>
          <PendingSubmitButton variant="outline" pendingText="Marking...">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </PendingSubmitButton>
        </form>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {notifications.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unread</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {unreadCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Read</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {notifications.length - unreadCount}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={!notification.read_at ? "border-primary/50" : ""}
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
                  <Bell className="h-4 w-4" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{notification.title}</h2>
                    {!notification.read_at && <Badge>New</Badge>}
                    <Badge variant="outline" className="capitalize">
                      {notification.type}
                    </Badge>
                  </div>

                  {notification.message && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>

                  {notification.target_url && (
                    <Link
                      href={notification.target_url}
                      className="mt-2 inline-flex h-auto p-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Open related item
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!notification.read_at && (
                  <form action={markNotificationRead.bind(null, notification.id)}>
                    <PendingSubmitButton size="sm" variant="outline" pendingText="Saving...">
                      Mark read
                    </PendingSubmitButton>
                  </form>
                )}

                <form action={deleteNotification.bind(null, notification.id)}>
                  <PendingSubmitButton size="sm" variant="ghost" pendingText="Deleting...">
                    <Trash2 className="h-4 w-4" />
                  </PendingSubmitButton>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No notifications found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}