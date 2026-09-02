"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markNotificationRead } from "@/app/(admin)/crm/notifications/actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderNotification = {
    id: string;
    title: string;
    message: string | null;
    target_url: string | null;
    read_at: string | null;
    created_at: string;
};

export function HeaderNotifications() {
    const supabase = createClient();
    const router = useRouter();
    const { profile } = useAuth();
    const [notifications, setNotifications] = React.useState<HeaderNotification[]>([]);

    const fetchNotifications = React.useCallback(async () => {
        const { data } = await supabase
            .from("notifications")
            .select("id, title, message, target_url, read_at, created_at")
            .or(`recipient_id.eq.${profile.id},recipient_id.is.null`)
            .order("created_at", { ascending: false })
            .limit(10);

        setNotifications((data ?? []) as HeaderNotification[]);
    }, [profile.id, supabase]);

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);


    React.useEffect(() => {
        const interval = window.setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => window.clearInterval(interval);
    }, [fetchNotifications]);


    const unreadCount = notifications.filter((item) => !item.read_at).length;



    const openNotification = async (notification: HeaderNotification) => {
        console.log("Notification clicked:", notification.id, notification.target_url);
        if (!notification.read_at) {
            await markNotificationRead(notification.id);
            await fetchNotifications();
            router.refresh();
        }
        router.push(notification.target_url || "/crm/notifications");
    };

    function cn(arg0: string, arg1: string | boolean): string | ((state: import("@base-ui/react").ContextMenuItemState) => string | undefined) | undefined {
        return [arg0, arg1].filter(Boolean).join(" ");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" className="relative" />}
            >
                <Bell className="h-4 w-4" />

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    {unreadCount > 0 && <Badge>{unreadCount} new</Badge>}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                        key={notification.id}
                        onClick={() => openNotification(notification)}
                        className={cn(
                            "flex cursor-pointer flex-col items-start gap-1",
                            !notification.read_at && "bg-muted/50" // ya koi aur highlight
                        )}
                    >
                        <span className="font-medium">{notification.title}</span>

                        {notification.message && (
                            <span className="line-clamp-2 text-xs text-muted-foreground">
                                {notification.message}
                            </span>
                        )}

                        <span className="text-[11px] text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                        </span>
                    </DropdownMenuItem>
                ))}

                {notifications.length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push("/crm/notifications")}>
                    View all notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}






