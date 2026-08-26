"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Phone, Mail, MessageCircle, ArrowLeft, Star, Ticket } from "lucide-react";

type CustomerDetail = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  first_source: string | null;
  last_source: string | null;
  first_contact: string;
  last_activity: string;
  tags: string[];
  status: string;
  notes: string | null;
  activities: {
    id: string;
    activity_type: string;
    description: string;
    actor_type: string | null;
    created_at: string;
  }[];
  leads: { id: string; lead_type: string; source: string; status: string; created_at: string }[];
  appointments: { id: string; service: { name: string }; date: string; time: string; status: string }[];
  reviews: { id: string; rating: number; feedback: string; created_at: string }[];
  coupons: { id: string; code: string; used_at: string }[];
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select(`
          *,
          activities:activities(*),
          leads:leads(*),
          appointments:appointments(*)
        `)
        .eq("id", id)
        .single();
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      setCustomer(data as CustomerDetail);
      setLoading(false);
    };
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) return <div className="p-4">Customer not found</div>;

  const stats = {
    totalLeads: customer.leads.length,
    totalAppointments: customer.appointments.length,
    totalReviews: customer.reviews.length,
    totalCouponsUsed: customer.coupons.length,
  };

  return (
    <div className="p-4 md:p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{customer.status}</Badge>
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Phone className="mr-2 h-4 w-4" /> Call</Button>
          <Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>
          <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Email</Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Leads</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalLeads}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Appointments</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalAppointments}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Reviews</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalReviews}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Coupons Used</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalCouponsUsed}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.activities.map((act) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">{act.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(act.created_at), "PPpp")} • {act.actor_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead><tr className="border-b"><th className="p-3 text-left">Type</th><th className="p-3 text-left">Source</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Created</th></tr></thead>
                <tbody>
                  {customer.leads.map((lead) => (
                    <tr key={lead.id} className="border-b">
                      <td className="p-3">{lead.lead_type}</td>
                      <td className="p-3">{lead.source}</td>
                      <td className="p-3"><Badge variant="outline">{lead.status}</Badge></td>
                      <td className="p-3 text-muted-foreground">{format(new Date(lead.created_at), "PP")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead><tr className="border-b"><th className="p-3 text-left">Service</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Time</th><th className="p-3 text-left">Status</th></tr></thead>
                <tbody>
                  {customer.appointments.map((apt) => (
                    <tr key={apt.id} className="border-b">
                      <td className="p-3">{apt.service?.name || "-"}</td>
                      <td className="p-3">{apt.date}</td>
                      <td className="p-3">{apt.time}</td>
                      <td className="p-3"><Badge variant="outline">{apt.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead><tr className="border-b"><th className="p-3 text-left">Rating</th><th className="p-3 text-left">Feedback</th><th className="p-3 text-left">Created</th></tr></thead>
                <tbody>
                  {customer.reviews.map((rev) => (
                    <tr key={rev.id} className="border-b">
                      <td className="p-3"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {rev.rating}</td>
                      <td className="p-3">{rev.feedback}</td>
                      <td className="p-3 text-muted-foreground">{format(new Date(rev.created_at), "PP")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead><tr className="border-b"><th className="p-3 text-left">Code</th><th className="p-3 text-left">Used At</th></tr></thead>
                <tbody>
                  {customer.coupons.map((cp) => (
                    <tr key={cp.id} className="border-b">
                      <td className="p-3"><Ticket className="h-4 w-4 inline mr-1" /> {cp.code}</td>
                      <td className="p-3 text-muted-foreground">{format(new Date(cp.used_at), "PP")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}