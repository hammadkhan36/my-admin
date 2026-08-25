// import { leads } from "@/lib/crm-data";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Phone, Mail, MessageCircle, User, Clock } from "lucide-react";

// export default function LeadDetailPage({ params }: { params: { id: string } }) {
//   const lead = leads.find((l) => l.id === params.id);
//   if (!lead) return <div>Lead not found</div>;

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold">{lead.customer}</h1>
//           <div className="flex items-center gap-2 mt-1">
//             <Badge>{lead.status}</Badge>
//             <span className="text-sm text-muted-foreground">Created {lead.createdAt}</span>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline"><Phone className="mr-2 h-4 w-4" /> Call</Button>
//           <Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>
//           <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Email</Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Customer Info */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Customer Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{lead.email}</span></div>
//             <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{lead.phone}</span></div>
//             {lead.whatsapp && <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp</span><span>{lead.whatsapp}</span></div>}
//             <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{lead.service}</span></div>
//             <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span>{lead.source}</span></div>
//             {lead.landingPage && <div className="flex justify-between"><span className="text-muted-foreground">Landing Page</span><span>{lead.landingPage}</span></div>}
//             {lead.campaign && <div className="flex justify-between"><span className="text-muted-foreground">Campaign</span><span>{lead.campaign}</span></div>}
//             <div className="flex justify-between"><span className="text-muted-foreground">Assigned Staff</span><span>{lead.assignedStaff}</span></div>
//             <div>
//               <span className="text-muted-foreground">Tags</span>
//               <div className="flex flex-wrap gap-1 mt-1">
//                 {lead.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Notes & Activity */}
//         <div className="lg:col-span-2 space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Notes</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-muted-foreground">{lead.notes || "No notes yet."}</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader>
//               <CardTitle>Activity Timeline</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {lead.activity.map((act, index) => (
//                   <div key={index} className="flex items-start gap-3">
//                     <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium">{act.text}</p>
//                       <p className="text-xs text-muted-foreground">{act.time}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Status Change Actions */}
//       <Card className="mt-4">
//         <CardContent className="flex flex-wrap gap-2 py-4">
//           <Button variant="outline">Mark as Contacted</Button>
//           <Button variant="outline">Mark as Qualified</Button>
//           <Button variant="outline">Mark as Won</Button>
//           <Button variant="outline">Mark as Lost</Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }






"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase-browser";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Phone,
  Mail,
  MessageCircle,
  User,
  CalendarClock,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

type LeadDetail = {
  id: string;
  customer_id: string;
  lead_type: string;
  source: string;
  status: string;
  priority: string | null;
  message: string | null;
  first_touch_source: string | null;
  first_landing_page: string | null;
  last_touch_source: string | null;
  conversion_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    whatsapp: string | null;
    first_source: string | null;
    last_source: string | null;
  } | null;
  service: {
    name: string;
  } | null;
  appointment: {
    id: string;
    date: string;
    time: string;
    status: string;
  } | null;
  activities: {
    id: string;
    actor_type: string | null;
    activity_type: string;
    description: string;
    metadata: any;
    created_at: string;
  }[];
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const router = useRouter();
  const [lead, setLead] = React.useState<LeadDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select(
          `*,
          customer:customers(*),
          service:services(name),
          appointment:appointments(id, date, time, status),
          activities:activities(*)`
        )
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Failed to load lead");
        setLoading(false);
        return;
      }
      setLead(data as LeadDetail);
      setLoading(false);
    };
    fetchLead();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lead) {
    return <div className="p-4">Lead not found</div>;
  }

  const statusColors: Record<string, string> = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Qualified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    Won: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    Lost: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  };

  return (
    <div className="p-4 md:p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{lead.customer?.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Created {format(new Date(lead.created_at), "PPpp")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Phone className="mr-2 h-4 w-4" /> Call</Button>
          <Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>
          <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Email</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Info */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lead Type</span>
              <span className="font-medium">{lead.lead_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span className="font-medium">{lead.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{lead.service?.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority</span>
              <span className="font-medium">{lead.priority || "-"}</span>
            </div>
            {lead.message && (
              <div>
                <p className="text-muted-foreground">Message</p>
                <p className="text-sm mt-1">{lead.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{lead.customer?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{lead.customer?.email || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">WhatsApp</span>
              <span className="font-medium">{lead.customer?.whatsapp || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">First Source</span>
              <span className="font-medium">{lead.customer?.first_source || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Source</span>
              <span className="font-medium">{lead.customer?.last_source || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Attribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">First Touch Source</span>
              <span className="font-medium">{lead.first_touch_source || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">First Landing Page</span>
              <span className="font-medium">{lead.first_landing_page || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Touch Source</span>
              <span className="font-medium">{lead.last_touch_source || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conversion Page</span>
              <span className="font-medium">{lead.conversion_page || "-"}</span>
            </div>
            {lead.utm_source && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">UTM Source</span>
                <span className="font-medium">{lead.utm_source}</span>
              </div>
            )}
            {lead.utm_campaign && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">UTM Campaign</span>
                <span className="font-medium">{lead.utm_campaign}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Link if exists */}
      {lead.appointment && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Linked Appointment</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span>{lead.appointment.date} at {lead.appointment.time}</span>
            <Badge>{lead.appointment.status}</Badge>
            <Button variant="link" onClick={() => router.push(`/appointments/${lead.appointment?.id}`)}>
              View
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>All events related to this lead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lead.activities.length === 0 ? (
              <p className="text-muted-foreground">No activities recorded.</p>
            ) : (
              lead.activities.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm font-medium">{act.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(act.created_at), "PPpp")} • {act.actor_type}
                    </p>
                    {act.metadata && Object.keys(act.metadata).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.entries(act.metadata).map(([key, value]) => (
                          <span key={key}>{key}: {String(value)} </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}