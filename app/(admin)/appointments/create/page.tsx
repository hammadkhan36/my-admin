"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateAppointmentPage() {
  const supabase = createClient();
  const router = useRouter();
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWhatsApp, setCustomerWhatsApp] = useState("");
  const [customerFound, setCustomerFound] = useState<any>(null);
  const [service, setService] = useState("");
  const [staff, setStaff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [source, setSource] = useState("Admin Created");
  const [notes, setNotes] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Fetch services and staff on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: servicesData } = await supabase.from("appointment_services").select("*");
      const { data: staffData } = await supabase.from("staff").select("*");
      if (servicesData) setServices(servicesData);
      if (staffData) setStaffList(staffData);
    };
    fetchData();
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
      setCustomerWhatsApp(data.whatsapp || "");
      toast.success("Existing customer found");
    } else {
      setCustomerFound(null);
      toast.info("No customer found, create new");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Find or create customer
    let customerId: string | null = customerFound?.id || null;
    if (!customerId) {
      // Create new customer
      const { data: newCustomer, error: custError } = await supabase
        .from("customers")
        .insert({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          whatsapp: customerWhatsApp,
          first_source: source,
          last_source: source,
          first_contact: new Date().toISOString().split("T")[0],
          last_activity: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (custError) {
        toast.error("Failed to create customer");
        return;
      }
      customerId = newCustomer.id;
    }

    // 2. Create appointment
    const { data: newAppointment, error: apptError } = await supabase
      .from("appointments")
      .insert({
        customer_id: customerId,
        service_id: service,
        staff,
        date,
        time,
        duration,
        status: "Pending",
        source,
        notes,
      })
      .select("id")
      .single();
    if (apptError) {
      toast.error("Failed to create appointment");
      return;
    }

    // 3. Add activity
    await supabase.from("activities").insert({
      customer_id: customerId,
      appointment_id: newAppointment.id,
      actor_type: "admin",
      activity_type: "appointment_created",
      description: `Appointment created for ${service}`,
      metadata: { service, staff, date, time },
    });

    // 4. Create notification
    await supabase.from("notifications").insert({
      type: "new_appointment",
      title: "New Appointment Request",
      description: `${customerName} - ${service} on ${date} at ${time}`,
      customer_id: customerId,
      appointment_id: newAppointment.id,
    });

    toast.success("Appointment created successfully!");
    router.push("/appointments");
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Customer Phone</Label>
              <div className="flex gap-2">
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
                <Button type="button" variant="outline" onClick={handlePhoneSearch}>
                  Search
                </Button>
              </div>
              {customerFound && <p className="text-xs text-emerald-600">Found: {customerFound.name}</p>}
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
                <Label>WhatsApp</Label>
                <Input value={customerWhatsApp} onChange={(e) => setCustomerWhatsApp(e.target.value)} />
              </div>
              <div>
                <Label>Service</Label>
                <Select value={service} onValueChange={(value) => setService(value ?? "")} required>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Staff</Label>
                  <Select value={staff} onValueChange={(value) => setStaff(value ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </div>
              <div>
                <Label>Source</Label>
                <Input value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Create Appointment</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
