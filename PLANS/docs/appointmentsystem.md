



1. Sabse pehle Customer ko central entity banao

Appointment ke waqt customer:

Customer
├── Name
├── Phone
├── Email
├── WhatsApp
├── Source
├── Created At
├── Last Activity
├── Tags
└── Status

Lekin important point:

Appointment ke liye naya customer record automatically create nahi karna agar same customer already exist karta hai.

Example:

Pehli baar:

Hammad Tahir
03xx-xxxxxxx

Appointment karta hai.

System check karega:

Existing Customer?
        ↓
       YES
        ↓
Existing Customer ID use karo
        ↓
New Activity create karo

Agar nahi mila:

Existing Customer?
        ↓
        NO
        ↓
Create Customer
        ↓
Customer ID
        ↓
Create Appointment + Activity
2. Customer ID sab systems ko connect karegi

Ye tumhare system ka main backbone hona chahiye.

Example:

Customer ID
CUS-10284

Is customer ne:

Lead
Appointment
Review
Coupon
Offer
Website Form
WhatsApp Click
Call

sab kuch kiya.

To sab activities internally:

customer_id = CUS-10284

ke saath connected hongi.

Is se tum complete customer journey dekh sakte ho.

3. Example: Customer ki complete journey

Suppose Sarah pehli baar website par aati hai.

Step 1 — Website Lead

Sarah ne:

Wedding Cake

ke liye contact form submit kiya.

Customer create:

Sarah Johnson
Customer ID: CUS-10284

Activity:

Aug 20 — Lead Created
Source: Google Organic
Service: Wedding Cake
Step 2 — Lead Qualified

Admin ne lead ko:

New
↓
Contacted
↓
Qualified

kiya.

Activities:

Aug 20 10:32 AM
Lead Created

Aug 20 11:10 AM
Status changed
New → Contacted

Aug 20 11:35 AM
Status changed
Contacted → Qualified
Step 3 — Appointment

Sarah appointment request karti hai:

Service:
Wedding Cake Consultation

Date:
Aug 25

Time:
3:00 PM

New customer create nahi hoga.

Instead:

Existing Customer
CUS-10284
        ↓
Appointment created
        ↓
Activity created

Activity:

Aug 24 04:21 PM

Appointment Requested

Wedding Cake Consultation
Aug 25 — 3:00 PM
4. Appointment ka complete activity history

Ab appointment ke liye bhi separate appointment activity timeline hogi.

Example:

Appointment Activity

Aug 24 — 04:21 PM
Appointment requested

Aug 24 — 04:25 PM
Notification sent to admin

Aug 24 — 04:32 PM
Appointment confirmed

Aug 24 — 04:35 PM
Confirmation notification sent

Aug 25 — 01:10 PM
Customer rescheduled

Aug 25 — 01:15 PM
Appointment rescheduled
3:00 PM → 4:00 PM

Aug 25 — 03:30 PM
Reminder sent

Aug 25 — 04:52 PM
Appointment completed

Agar cancel kare:

Aug 25 — 02:10 PM
Appointment cancelled

Reason:
Customer requested cancellation

Ye bahut useful hoga.

5. Customer Activity Timeline aur Appointment Activity Timeline dono hon

Ye distinction important hai.

Customer Timeline

Customer ne business ke saath overall kya kya kiya:

CUSTOMER ACTIVITY

Aug 20
Lead submitted

Aug 20
Lead contacted

Aug 24
Appointment requested

Aug 24
Appointment confirmed

Aug 25
Appointment rescheduled

Aug 25
Appointment completed

Sep 02
Review submitted

Sep 10
Coupon used

Ye customer ki complete lifetime journey hai.

Appointment Timeline

Sirf particular appointment:

APPOINTMENT ACTIVITY

Appointment Created
       ↓
Request Received
       ↓
Confirmed
       ↓
Reminder Sent
       ↓
Rescheduled
       ↓
Completed

Is se dono cheezen clean rahengi.

6. Activity Logs ko aur powerful bana sakte ho

Tumhare current System → Activity Logs bhi isi architecture ke saath connect hone chahiye.

Lekin yahan ek difference hoga.

Customer Activity

Customer-centric:

Customer
   ↓
All activities
Appointment Activity

Appointment-centric:

Appointment
   ↓
All activities
System Activity Logs

Admin/user-centric:

Who did what?

Example:

Hammad
Updated Appointment
CRM/Appointments
Changed status
Pending → Confirmed
Aug 24 04:32 PM

Yani:

Customer Timeline = customer ki journey

Appointment Timeline = appointment ki journey

Activity Logs = system/user audit trail

Ye teenon alag concepts hain, lekin interconnected hain.

7. Notification system bhi central hona chahiye

Tum bilkul sahi keh rahe ho.

Appointment ke liye alag notification system mat banana.

Tumhara existing:

System → Notifications

hi central notification center hoga.

Usmein different notification types hongi:

Notifications

All
Leads
Appointments
Reviews
Customers
Marketing
System

Example:

🔔 New Lead
Sarah submitted a wedding cake inquiry
2 min ago

📅 New Appointment
Michael requested a consultation
5 min ago

⭐ New Review
5-star review received
18 min ago

👤 Customer Updated
Sarah's profile was updated
32 min ago
8. Appointment notification ka complete flow

Customer:

Book Appointment
       ↓
Appointment Request
       ↓
Appointment Created
       ↓
Notification Created

Admin notification:

NEW APPOINTMENT REQUEST

Sarah Johnson

Wedding Cake Consultation

Aug 25
3:00 PM

[View Appointment]

Admin View Appointment karega.

Wahan directly:

Customer
Appointment
Activity

sab connected honge.

9. Notification ko action-based banana

Sirf notification show nahi karni.

Notification click karne par relevant record open hona chahiye.

Example:

New appointment request
Sarah Johnson

Click:

Appointment Detail Drawer

Aur:

View Customer

click karne par:

Customer Detail
CUS-10284

open ho.

Ye UX bohat professional lagega.

10. Customer Detail Page ko powerful banao

Customer open karne par:

Sarah Johnson
Customer since Aug 20, 2026

Phone
Email
WhatsApp

Tags
VIP • Wedding

────────────────────────

Overview

Total Leads        2
Appointments       4
Completed          3
Reviews            1
Coupons Used       2

Phir:

Activity Timeline
Timeline
Aug 25
Appointment completed

Aug 25
Appointment rescheduled

Aug 24
Appointment confirmed

Aug 24
Appointment requested

Aug 20
Lead created

Aug 20
Lead contacted

Yani admin ko customer ka complete history ek jagah mil jayega.

11. Same customer ko identify kaise karna hai?

Ye backend mein carefully design karna hoga.

Primary matching:

Phone

Secondary:

Email

Example:

Phone match?
   ↓
YES
   ↓
Existing customer

Agar phone missing:

Email match?
   ↓
YES
   ↓
Existing customer

Lekin name ko unique identifier nahi banana.

Do Sarah Johnson ho sakti hain.

Isliye:

Customer ID

system ka permanent identifier hoga.

12. Appointment aur Lead ko bhi connect karo

Ye tumhare SaaS ka ek aur strong point hoga.

Example:

Lead
  ↓
Appointment
  ↓
Customer

Lead record:

Lead #L-1024

Customer:
Sarah Johnson

Source:
Google Organic

Service:
Wedding Cake

Status:
Qualified

Appointment:
APT-5021

Yani admin ko pata chalega:

Ye appointment kis lead se originate hui thi.

13. Source tracking bhi preserve karo

Tumne specifically kaha:

ye kahan se aya

Bilkul.

Customer ke saath:

First Source
Last Source

rakhna useful hoga.

Example:

Customer

First Source:
Google Organic

Latest Source:
Direct

First Contact:
Aug 20

Aur appointment:

Appointment Source:
Website Booking

Booking Page:
/services/wedding-cakes

Campaign:
Summer Offer

Is se future analytics mein pata chalega:

Google
   ↓
Website
   ↓
Lead
   ↓
Appointment
   ↓
Customer
14. Appointment source bhi important hai

Appointment ke source options:

Website
Admin Created
Phone
WhatsApp
Google
Referral
Campaign
Other

Example:

Admin ne phone par booking create ki:

Source:
Phone / Admin Created

Website se:

Source:
Website Booking

Ye reporting ke liye important hai.

15. Appointment aur Customer relationship

Main conceptual relationship kuch aisi rakhunga:

CUSTOMER
   │
   ├── Leads
   │
   ├── Appointments
   │
   ├── Reviews
   │
   ├── Coupons
   │
   ├── Offers
   │
   └── Activities

Aur:

APPOINTMENT
   │
   ├── Customer
   ├── Service
   ├── Staff
   ├── Location
   ├── Source
   ├── Status
   └── Activities
16. Appointment status change = Activity automatically

Ye rule system mein globally rakhna chahiye.

For example:

Status:
Pending → Confirmed

Automatically:

Activity Created

Appointment confirmed
By: Hammad
Date: Aug 25
Time: 3:32 PM

Customer ne cancel kiya:

Appointment cancelled
By: Customer
Date: Aug 25
Time: 4:10 PM

Admin ne cancel kiya:

Appointment cancelled
By: Hammad
Date: Aug 25
Time: 4:15 PM
Reason: Business unavailable
17. Har important action activity generate kare

Appointment system mein:

Appointment requested
Appointment created
Appointment confirmed
Appointment rejected
Appointment rescheduled
Appointment cancelled
Appointment completed
Appointment marked no-show
Reminder sent
Customer updated
Staff changed
Service changed
Time changed
Date changed
Note added

sab activity ban sakte hain.

18. Admin ne kya kiya vs customer ne kya kiya

Ye bhi record hona chahiye.

Example:

Appointment confirmed

Actor:
Hammad Tahir

Actor Type:
Admin

Time:
Aug 25, 3:32 PM

Customer:

Appointment cancelled

Actor:
Sarah Johnson

Actor Type:
Customer

Time:
Aug 25, 4:10 PM

System:

Reminder sent

Actor:
System

Actor Type:
System

Time:
Aug 25, 2:00 PM

Ye audit trail ko next level bana dega.

19. Ek centralized Activity/Event system banao

Meri strongest recommendation ye hai:

Appointment ke liye alag-alag random logs banane ke bajaye central event/activity architecture rakho.

Conceptually:

Activity/Event

ID
Business ID
Customer ID
Lead ID       optional
Appointment ID optional
Actor ID      optional
Actor Type
Activity Type
Description
Metadata
Created At

Example:

activity_id: ACT-90231
business_id: BUS-001
customer_id: CUS-10284
appointment_id: APT-5021

actor_type: admin
actor_id: USER-12

activity_type:
appointment_confirmed

created_at:
2026-08-25 15:32

Is ek architecture ki wajah se tum future mein naye modules bhi easily connect kar sakte ho.

20. Future mein koi naya module aaye

Suppose future mein tum:

Messages
Invoices
Loyalty
Subscriptions
Forms

add karte ho.

Customer ke saath phir bhi:

Customer
   ↓
Activities

central timeline mein sab aa sakta hai.

Example:

Customer Timeline

Lead Created
Appointment Requested
Appointment Confirmed
Message Received
Appointment Completed
Review Received
Coupon Used
Invoice Created

Ye tumhare SaaS ko genuinely powerful CRM bana dega.

21. Final architecture

Tumhara complete system kuch aisa ban raha hai:

                    BUSINESS
                       │
                 BUSINESS USER
                       │
          ┌────────────┼────────────┐
          │            │            │
        LEADS       APPOINTMENTS   REVIEWS
          │            │            │
          └────────────┼────────────┘
                       │
                    CUSTOMER
                       │
             ┌─────────┼─────────┐
             │         │         │
          Activity   History   Analytics
             │
             ▼
       CENTRAL ACTIVITY
             │
     ┌───────┼────────┐
     │       │        │
   Lead   Appointment Review
     │       │        │
     └───────┼────────┘
             │
       NOTIFICATIONS
             │
             ▼
       ADMIN NOTIFICATION
Aur admin panel mein:
CRM
├── Leads
└── Customers
      └── Customer Detail
            ├── Overview
            ├── Leads
            ├── Appointments
            ├── Reviews
            ├── Coupons
            └── Activity Timeline

APPOINTMENTS
├── Appointments
├── Calendar
├── Availability
└── Appointment Activity

SYSTEM
├── Notifications
├── Activity Logs
└── Settings

Ye architecture main tumhare project ke liye strongly recommend karunga. Appointment ko isolated module nahi banana; Customer ID + Activity/Event system + Notification system ke saath first-class integration rakhni hai.

Aur ek important cheez: same customer dobara appointment/lead/form submit kare to customer duplicate nahi hoga; existing Customer ID ke under new transaction/activity create hogi. Is se tum future mein kisi bhi customer ki complete lifetime journey dekh sakoge.














##  ya plan tah is ko maan na deespseek ko da ka tayar kia results neecha han 






🗄️ Step 1: Database Schema (SQL)
Neeche SQL hai. Isay Supabase SQL Editor mein run karo. Hum pehle se bane tables ko extend karenge aur naye tables banayenge.

1.1 Customers Table (update existing)
Pehle wali customers table ko replace karo (agar pehle se hai to drop karke naya banao) – isme first_source, last_source, first_contact fields add honge.

sql
drop table if exists public.customers cascade;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  name text not null,
  phone text unique,
  email text unique,
  whatsapp text,
  first_source text,
  last_source text,
  first_contact date default current_date,
  last_activity timestamptz default now(),
  tags text[] default '{}',
  status text default 'Active',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index on phone/email for dedup
create index customers_phone_idx on public.customers(phone);
create index customers_email_idx on public.customers(email);
1.2 Appointments Table (update existing)
sql
drop table if exists public.appointments cascade;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  customer_id uuid references public.customers(id) on delete set null,
  service_id uuid references public.appointment_services(id) on delete set null,
  staff text,
  date date,
  time time,
  duration integer,
  status text default 'Pending',
  source text,
  booking_page text,
  campaign text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
1.3 Appointment Services Table (already exists, keep)
1.4 Activities Table (central event system)
sql
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  customer_id uuid references public.customers(id) on delete cascade,
  lead_id uuid,
  appointment_id uuid references public.appointments(id) on delete cascade,
  actor_type text, -- 'admin', 'customer', 'system'
  actor_id uuid,
  activity_type text, -- 'lead_created', 'appointment_created', etc.
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
1.5 Notifications Table (if not already)
sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  customer_id uuid,
  appointment_id uuid,
  type text, -- 'new_lead', 'new_appointment', etc.
  title text,
  description text,
  read boolean default false,
  created_at timestamptz default now()
);
📦 Step 2: Seed Data for Appointments (with Customer dedup)
sql
-- Insert customers (with unique phone/email)
insert into public.customers (business_id, name, phone, email, whatsapp, first_source, last_source, first_contact, tags, status, notes) values
(null, 'Sarah Johnson', '+92 300 1112223', 'sarah@example.com', '+92 300 1112223', 'Google Organic', 'Google Organic', '2024-08-20', '{"VIP","Wedding"}', 'Active', 'Wedding cake inquiry'),
(null, 'Michael Smith', '+92 321 4445556', 'michael@example.com', null, 'Facebook', 'Facebook', '2024-08-18', '{}', 'Active', null),
(null, 'Ali Raza', '+92 300 1234567', 'ali@example.com', '+92 300 1234567', 'Direct', 'Direct', '2024-08-10', '{"Hot"}', 'Active', 'Regular customer');

-- Insert appointment services (if not already)
insert into public.appointment_services (name, duration, price, staff, availability, buffer_time, booking_status) values
('Wedding Cake Consultation', 45, 2000, 'Sara', 'All days', 10, 'Active'),
('Haircut', 30, 1500, 'Ahmed, Sara', 'All days', 10, 'Active'),
('Hair Coloring', 90, 5000, 'Sara', 'Mon-Sat', 15, 'Active');

-- Insert appointments (link to customers)
insert into public.appointments (business_id, customer_id, service_id, staff, date, time, duration, status, source, booking_page, campaign) values
(null, (select id from public.customers where phone = '+92 300 1112223'), (select id from public.appointment_services where name = 'Wedding Cake Consultation'), 'Sara', '2024-08-25', '15:00', 45, 'Confirmed', 'Website Booking', '/services/wedding-cakes', 'Summer Offer'),
(null, (select id from public.customers where phone = '+92 321 4445556'), (select id from public.appointment_services where name = 'Haircut'), 'Ahmed', '2024-08-26', '10:00', 30, 'Pending', 'Admin Created', null, null);

-- Insert activities for customers and appointments
insert into public.activities (business_id, customer_id, appointment_id, actor_type, activity_type, description, metadata) values
(null, (select id from public.customers where phone = '+92 300 1112223'), (select id from public.appointments where date = '2024-08-25' and time = '15:00'), 'customer', 'appointment_requested', 'Appointment requested for Wedding Cake Consultation', '{"service":"Wedding Cake Consultation","date":"2024-08-25","time":"15:00"}'),
(null, (select id from public.customers where phone = '+92 300 1112223'), null, 'admin', 'lead_created', 'Lead created from Google Organic', '{"source":"Google Organic","service":"Wedding Cake"}');
🔧 Step 3: Implement Customer Dedup Logic (Frontend/Backend)
Appointment create karte waqt, hum customer phone/email se check karenge. Supabase query se existing customer dhundo.

Function in Appointment Form:
ts
const findOrCreateCustomer = async (customerData: { name: string; phone?: string; email?: string; whatsapp?: string }) => {
  const supabase = createClient();
  let customerId: string | null = null;

  if (customerData.phone) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerData.phone)
      .single();
    if (existing) customerId = existing.id;
  } else if (customerData.email) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerData.email)
      .single();
    if (existing) customerId = existing.id;
  }

  if (!customerId) {
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        whatsapp: customerData.whatsapp,
        first_source: 'Website Booking', // ya jo bhi source
        last_source: 'Website Booking',
        first_contact: new Date().toISOString().split('T')[0],
        last_activity: new Date().toISOString(),
        tags: [],
        status: 'Active',
      })
      .select('id')
      .single();
    if (error) throw error;
    customerId = newCustomer.id;
  }
  return customerId;
};
📝 Step 4: Update Appointments Page to Fetch from Supabase
app/(admin)/appointments/page.tsx – List with customer info
tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Eye, Edit, CheckCircle, XCircle, CalendarClock } from "lucide-react";
import { toast } from "sonner";

type Appointment = {
  id: string;
  customer_id: string;
  customer: { name: string; phone: string; email?: string };
  service: { name: string };
  staff: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  source: string;
};

export default function AppointmentsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(name, phone, email),
        service:appointment_services(name)
      `)
      .order('date', { ascending: true });

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load appointments");
      setLoading(false);
      return;
    }
    setAppointments(data || []);
    setLoading(false);
  };

  // Filtering based on search, status, tabs (today, upcoming, etc.)
  const filtered = appointments.filter((apt) => {
    const matchesSearch = apt.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      apt.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
      apt.staff?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;

    // Tab filters
    const today = new Date().toISOString().split("T")[0];
    if (activeTab === "today") {
      if (apt.date !== today) return false;
    } else if (activeTab === "upcoming") {
      if (apt.status !== "Confirmed" && apt.status !== "Pending") return false;
    } else if (activeTab === "completed") {
      if (apt.status !== "Completed") return false;
    } else if (activeTab === "cancelled") {
      if (apt.status !== "Cancelled") return false;
    } else if (activeTab === "no-show") {
      if (apt.status !== "No-show") return false;
    } else if (activeTab === "pending") {
      if (apt.status !== "Pending") return false;
    }

    return matchesSearch && matchesStatus;
  });

  const statusColor: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    Cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    "No-show": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Button onClick={() => router.push("/appointments/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Appointment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="no-show">No-show</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="No-show">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{apt.customer?.name}</p>
                    <p className="text-xs text-muted-foreground">{apt.customer?.phone}</p>
                  </div>
                </TableCell>
                <TableCell>{apt.service?.name}</TableCell>
                <TableCell>{apt.staff}</TableCell>
                <TableCell>{apt.date}</TableCell>
                <TableCell>{apt.time}</TableCell>
                <TableCell>{apt.duration} min</TableCell>
                <TableCell>
                  <Badge className={statusColor[apt.status]}>{apt.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => router.push(`/appointments/${apt.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm"><CheckCircle className="h-4 w-4 text-emerald-500" /></Button>
                    <Button variant="ghost" size="icon-sm"><XCircle className="h-4 w-4 text-red-500" /></Button>
                    <Button variant="ghost" size="icon-sm"><CalendarClock className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
📝 Step 5: Create Appointment Form with Customer Search
app/(admin)/appointments/create/page.tsx

Is page par customer phone/email daal kar search karein, ya naya customer add karein. Yeh code partial hai, lekin flow clear hai.

tsx
"use client";

import { useState } from "react";
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
                <Select value={service} onValueChange={setService} required>
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
                <Select value={staff} onValueChange={setStaff}>
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
⏱️ Step 6: Activity Timeline (Customer & Appointment)
Neeche components banao.

components/customer-timeline.tsx
tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export function CustomerTimeline({ customerId }: { customerId: string }) {
  const supabase = createClient();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (data) setActivities(data);
    };
    fetchActivities();
  }, [customerId]);

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
          <div>
            <p className="text-sm font-medium">{act.description}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(act.created_at).toLocaleString()} • {act.actor_type}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
components/appointment-timeline.tsx
Same, but filter by appointment_id.

🔔 Step 7: Notifications Integration
Appointment create par notification ban jati hai (upar code mein). Notifications page fetch karega notifications table se.

✅ Ab Test Karo
SQL schema + seed data run karo.

lib/supabase-browser.ts client use karo.

Upar diye pages/components ko project mein add karo.

/appointments par jao, data Supabase se aayega.

/appointments/create par naya appointment banao — customer auto-dedup hoga aur activity/notification create hogi.

Customer timeline component ko customer detail page mein use karo.

🚀 Next Steps
Appointment detail page with activity timeline.

Customer detail page with full journey.

Calendar with drag-drop (Supabase backed).

All other modules similar migration.

Bhai, ye appointment system ka core ready hai. Ab aap isay implement karo, phir baqi modules ki taraf badhen. Koi specific issue ho to pooch lena! 😊







