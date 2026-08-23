"use client";

import { notifications } from "@/lib/crm-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications);
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? notifs
    : notifs.filter((n) => n.category === activeCategory);

  const markRead = (id: string) => {
    setNotifs(notifs.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const categories = ["all", "Leads", "Reviews", "Marketing", "Customers", "System"];

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={markAllRead}>Mark All Read</Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat === "all" ? "All" : cat}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-2">
          {filtered.map((notif) => (
            <Card key={notif.id} className={notif.read ? "opacity-70" : ""}>
              <CardContent className="flex items-start justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{notif.category}</Badge>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="font-medium mt-1">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
                {!notif.read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(notif.id)}>
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
}