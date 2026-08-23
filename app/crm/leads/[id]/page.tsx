import { leads } from "@/lib/crm-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MessageCircle, User, Clock } from "lucide-react";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return <div>Lead not found</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{lead.customer}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{lead.status}</Badge>
            <span className="text-sm text-muted-foreground">Created {lead.createdAt}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Phone className="mr-2 h-4 w-4" /> Call</Button>
          <Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>
          <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Email</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{lead.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{lead.phone}</span></div>
            {lead.whatsapp && <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp</span><span>{lead.whatsapp}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{lead.service}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span>{lead.source}</span></div>
            {lead.landingPage && <div className="flex justify-between"><span className="text-muted-foreground">Landing Page</span><span>{lead.landingPage}</span></div>}
            {lead.campaign && <div className="flex justify-between"><span className="text-muted-foreground">Campaign</span><span>{lead.campaign}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Assigned Staff</span><span>{lead.assignedStaff}</span></div>
            <div>
              <span className="text-muted-foreground">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {lead.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Activity */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{lead.notes || "No notes yet."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lead.activity.map((act, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{act.text}</p>
                      <p className="text-xs text-muted-foreground">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Actions */}
      <Card className="mt-4">
        <CardContent className="flex flex-wrap gap-2 py-4">
          <Button variant="outline">Mark as Contacted</Button>
          <Button variant="outline">Mark as Qualified</Button>
          <Button variant="outline">Mark as Won</Button>
          <Button variant="outline">Mark as Lost</Button>
        </CardContent>
      </Card>
    </div>
  );
}