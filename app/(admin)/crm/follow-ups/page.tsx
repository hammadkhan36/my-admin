"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function FollowUpsPage() {
  const supabase = createClient();
  const [followUps, setFollowUps] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("follow_ups")
      .select(`*, customer:customers(name, phone)`)
      .order("due_date", { ascending: true });
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setFollowUps(data || []);
    setLoading(false);
  };

  const filtered = followUps.filter(f =>
    f.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.note?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Schedule Follow-up</Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search follow-ups..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(f => (
                <TableRow key={f.id}>
                  <TableCell>{f.customer?.name}</TableCell>
                  <TableCell>{f.due_date}</TableCell>
                  <TableCell>{f.due_time}</TableCell>
                  <TableCell>{f.note}</TableCell>
                  <TableCell><Badge variant="outline">{f.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}