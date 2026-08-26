"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateLeadPage() {
  const supabase = createClient();
  const router = useRouter();
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerFound, setCustomerFound] = React.useState<any>(null);
  const [leadType, setLeadType] = React.useState("Contact Inquiry");
  const [source, setSource] = React.useState("Google Organic");
  const [status, setStatus] = React.useState("New");
  const [serviceId, setServiceId] = React.useState<string>("");
  const [message, setMessage] = React.useState("");
  const [services, setServices] = React.useState<any[]>([]);
  const [loadingServices, setLoadingServices] = React.useState(true);

  React.useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from("services").select("*");
      if (data) setServices(data);
      setLoadingServices(false);
    };
    fetchServices();
  }, []);

  const handlePhoneSearch = async () => {
    if (!customerPhone) return;
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", customerPhone)
      .single();
    if (data) {
      setCustomerFound(data);
      setCustomerName(data.name);
      setCustomerEmail(data.email || "");
      toast.success("Existing customer found");
    } else {
      setCustomerFound(null);
      setCustomerName("");
      setCustomerEmail("");
      toast.info("No customer found, create new");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      toast.error("Name and phone are required");
      return;
    }

    let customerId: string | null = customerFound?.id || null;

    // Create or update customer
    if (customerId) {
      // Update existing customer's last activity and source maybe
      await supabase
        .from("customers")
        .update({ last_activity: new Date().toISOString(), last_source: source })
        .eq("id", customerId);
    } else {
      // Create new customer
      const { data: newCust, error: custError } = await supabase
        .from("customers")
        .insert({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          first_source: source,
          last_source: source,
          first_contact: new Date().toISOString().split("T")[0],
          last_activity: new Date().toISOString(),
          status: "Active",
        })
        .select("id")
        .single();
      if (custError) {
        toast.error("Failed to create customer");
        return;
      }
      customerId = newCust.id;
    }

    // Create lead
    const { data: newLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        customer_id: customerId,
        lead_type: leadType,
        source,
        status,
        service_id: serviceId || null,
        message,
      })
      .select("id")
      .single();
    if (leadError) {
      toast.error("Failed to create lead");
      return;
    }

    // Add activity
    await supabase.from("activities").insert({
      customer_id: customerId,
      lead_id: newLead.id,
      actor_type: "admin",
      activity_type: "lead_created",
      description: `Lead created: ${leadType}`,
      metadata: { source, service: serviceId },
    });

    // Notification
    await supabase.from("notifications").insert({
      type: "new_lead",
      title: "New Lead",
      description: `${customerName} - ${leadType}`,
      customer_id: customerId,
    });

    toast.success("Lead created successfully!");
    router.push("/crm/leads");
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Customer Phone</Label>
              <div className="flex gap-2">
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g., 03001234567"
                  required
                />
                <Button type="button" variant="outline" onClick={handlePhoneSearch}>
                  Search
                </Button>
              </div>
              {customerFound && (
                <p className="text-xs text-emerald-600">Existing: {customerFound.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>
              <div>
                <Label>Lead Type</Label>
                <Select
                  value={leadType}
                  onValueChange={(value) => value !== null && setLeadType(value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Contact Inquiry", "Quote Request", "Appointment Request", "Demo Request", "Newsletter Signup", "Download", "Callback Request", "Service Inquiry", "Product Inquiry"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source</Label>
                <Select value={source} onValueChange={(value) => value !== null && setSource(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Google Organic", "Google Ads", "Facebook", "Instagram", "Direct", "Referral", "Email", "WhatsApp", "Other"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => value !== null && setStatus(value)}
                  >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["New", "Contacted", "Qualified", "Won", "Lost"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Service</Label>
                <Select
                  value={serviceId}
                  onValueChange={(value) => value !== null && setServiceId(value)}
                >
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
            </div>

            <Button type="submit" className="w-full">Create Lead</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
