# Website Integration Guide

This admin dashboard is a reusable business admin system. It is designed as a single-business setup per Supabase project.

For every new business, we deploy:

- one business website
- one admin dashboard
- one Supabase database
- one owner account
- one superadmin account

The business website connects with the admin dashboard through public API routes.

## System Idea

This is not a multi-tenant shared database setup.

Each business gets its own Supabase project and admin dashboard environment.

```txt
Business Website
      ↓
Admin Public APIs
      ↓
Supabase Database
      ↓
Admin Dashboard




User Roles
Role	Purpose
superadmin	Our company/admin team. Can control business settings, features, subscription and permissions.
owner	Business owner. Main business user.
admin	Can manage most business data and team members.
manager	Can manage daily operations.
supervisor	Limited management role.
staff	Basic limited access.

Important:

superadmin is created manually in Supabase Auth.
owner is created manually in Supabase Auth.
Other users can be created from the dashboard.
Public signup should stay disabled.
Permission System

The dashboard uses a hybrid permission system:

Role-based permissions
Per-user permission overrides

Example:

A manager role may have appointments.update, but for one specific manager we can deny that permission using user overrides.

Important Tables
Table	Purpose
profiles	Dashboard users and roles
permissions	All permission keys
role_permissions	Default permissions per role
user_permission_overrides	Custom allow/deny permissions per user
business_settings	Business name, logo, contact, theme
feature_settings	Enable/disable/lock modules
subscriptions	Plan, expiry, renewal code
audit_logs	Activity logs
customers	Customer records
leads	Website/manual leads
lead_notes	Notes on leads
lead_status_history	Lead status tracking
notifications	Dashboard notifications
business_hours	Weekly opening hours
service_areas	Areas served by business
services	Business services
appointments	Appointment records
appointment_status_history	Appointment status timeline
Required Admin Environment Variables

Add these in admin dashboard .env.local:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

WEBSITE_CONFIG_API_KEY=
WEBSITE_LEAD_API_KEY=
WEBSITE_APPOINTMENT_API_KEY=

Important:

NEXT_PUBLIC_SUPABASE_URL is safe for browser.
NEXT_PUBLIC_SUPABASE_ANON_KEY is safe for browser with RLS.
SUPABASE_SERVICE_ROLE_KEY is private.
Never expose SUPABASE_SERVICE_ROLE_KEY in frontend code.
Website API keys should be used from website server routes in production.
Required Website Environment Variables

Add these in business website .env.local:

ADMIN_API_URL=https://admin.yourbusiness.com

WEBSITE_CONFIG_API_KEY=
WEBSITE_LEAD_API_KEY=
WEBSITE_APPOINTMENT_API_KEY=

ADMIN_API_URL should point to the deployed admin dashboard domain.

Example:

ADMIN_API_URL=https://admin.abc-bakery.com
Public APIs
API	Method	Purpose
/api/public/business-config	GET	Fetch business profile, services, hours and service areas
/api/public/leads	POST	Submit website lead
/api/public/appointments	POST	Submit appointment request
/api/public/appointments/slots	GET	Fetch available appointment slots
API Headers

Every public API request must send an API key.

Example:

x-api-key: your-secret-key

Each API has its own key:

API	Env Key
Business config	WEBSITE_CONFIG_API_KEY
Leads	WEBSITE_LEAD_API_KEY
Appointments	WEBSITE_APPOINTMENT_API_KEY
Appointment slots	WEBSITE_APPOINTMENT_API_KEY
Business Config API

Endpoint:

GET /api/public/business-config

Purpose:

The website uses this API to fetch business information from the admin dashboard.

It returns:

business name
short name
logo
favicon
theme color
contact email
contact phone
address
social links
active website services
business hours
service areas

Example website helper:

export async function getBusinessConfig() {
  const response = await fetch(
    `${process.env.ADMIN_API_URL}/api/public/business-config`,
    {
      headers: {
        "x-api-key": process.env.WEBSITE_CONFIG_API_KEY!,
      },
      next: { revalidate: 300 },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Business config failed to load.");
  }

  return result;
}

Example response:

{
  "success": true,
  "business": {
    "business_name": "ABC Bakery",
    "short_name": "ABC",
    "logo_url": "https://example.com/logo.png",
    "favicon_url": "https://example.com/favicon.ico",
    "theme_color": "#2563eb",
    "contact_email": "hello@example.com",
    "contact_phone": "+923001234567",
    "address": "Main Road, Attock",
    "social_links": {}
  },
  "services": [],
  "business_hours": [],
  "service_areas": []
}
Lead Submit API

Endpoint:

POST /api/public/leads

Purpose:

The website uses this API when a visitor submits a contact/lead form.

It creates:

customer
lead
lead status history
notification
activity log

Required fields:

Field	Required
name	Yes
phone	Yes
email	No
service	No
message	No
page_url	No
referrer	No
utm_source	No
utm_medium	No
utm_campaign	No

Website helper:

export async function submitLead(input: {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
  page_url?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}) {
  const response = await fetch(`${process.env.ADMIN_API_URL}/api/public/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.WEBSITE_LEAD_API_KEY!,
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Lead submit failed.");
  }

  return result;
}

Example request:

{
  "name": "Ali Khan",
  "phone": "+923001234567",
  "email": "ali@example.com",
  "service": "Website Design",
  "message": "I need pricing details.",
  "page_url": "https://example.com/services",
  "referrer": "https://google.com",
  "utm_source": "google",
  "utm_medium": "organic",
  "utm_campaign": "services-page"
}

Example response:

{
  "success": true,
  "lead_id": "uuid-here",
  "customer_id": "uuid-here",
  "message": "Lead submitted successfully."
}
Appointment Slots API

Endpoint:

GET /api/public/appointments/slots?date=2026-09-10&service_id=SERVICE_ID&interval=30

Purpose:

The website uses this API before submitting an appointment. It returns available time slots for a selected date.

Query params:

Param	Required	Example
date	Yes	2026-09-10
service_id	No	service uuid
interval	No	15, 30, 45, 60


Website helper:

export async function getAppointmentSlots(input: {
  date: string;
  service_id?: string;
  interval?: number;
}) {
  const params = new URLSearchParams({
    date: input.date,
    interval: String(input.interval || 30),
  });

  if (input.service_id) {
    params.set("service_id", input.service_id);
  }

  const response = await fetch(
    `${process.env.ADMIN_API_URL}/api/public/appointments/slots?${params.toString()}`,
    {
      headers: {
        "x-api-key": process.env.WEBSITE_APPOINTMENT_API_KEY!,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Appointment slots failed to load.");
  }

  return result;
}

Example response:

{
  "success": true,
  "date": "2026-09-10",
  "service_id": "uuid-here",
  "interval": 30,
  "slots": ["09:00", "09:30", "10:00", "10:30"]
}
Appointment Submit API

Endpoint:

POST /api/public/appointments

Purpose:

The website uses this API when a visitor submits an appointment request.

It creates:

customer
appointment
appointment status history
notification
activity log

Required fields:

Field	Required
customer_name	Yes
customer_phone	Yes
customer_email	No
service_id	No
appointment_date	Yes
appointment_time	Yes
notes	No

Website helper:

export async function submitAppointment(input: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}) {
  const response = await fetch(
    `${process.env.ADMIN_API_URL}/api/public/appointments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.WEBSITE_APPOINTMENT_API_KEY!,
      },
      body: JSON.stringify(input),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Appointment submit failed.");
  }

  return result;
}

Example request:

{
  "customer_name": "Ali Khan",
  "customer_phone": "+923001234567",
  "customer_email": "ali@example.com",
  "service_id": "uuid-here",
  "appointment_date": "2026-09-10",
  "appointment_time": "14:30",
  "notes": "Please call before appointment."
}

Example success response:

{
  "success": true,
  "appointment_id": "uuid-here",
  "message": "Appointment request submitted successfully."
}

Example validation response:

{
  "success": false,
  "error": "Selected time is outside business hours. Open time is 09:00 to 17:00."
}
Website Booking Flow
Website loads business config.
Website shows active services.
Visitor selects service.
Visitor selects date.
Website calls appointment slots API.
Website shows only available time slots.
Visitor selects time.
Website submits appointment request.
Admin receives pending appointment.
Admin gets notification.
Activity log is created.
Appointment status history is created.
Lead Flow
Visitor submits contact form.
Website sends lead API request.
System checks phone number.
If customer exists, customer is updated.
If customer does not exist, customer is created.
Lead is created.
Lead status history starts with new.
Notification is created.
Activity log is created.
Customer Logic

Phone number is the main unique customer identifier.

If the same phone number submits multiple leads or appointments:

same customer is reused
customer last_seen_at is updated
new lead/appointment is attached to same customer
Appointment Validation Rules

The appointment system checks:

Rule	Result
Business closed day	appointment blocked
Missing business hours	appointment blocked
Time before opening	appointment blocked
Time after closing	appointment blocked
24h business day	appointment allowed
Same service already booked at same time	appointment blocked
Cancelled/rejected old appointment	slot can be reused
Dashboard Modules Completed
Module	Status
Authentication	Complete
Roles	Complete
Permission overrides	Complete
Staff management	Complete
Logout/profile menu	Complete
Super admin dashboard	Basic complete
Business profile	Complete
Business hours	Complete
Service areas	Complete
Services	Complete
Customers	Complete
Leads	Complete
Notifications	Complete
Activity logs	Complete
Appointments dashboard	Complete
Appointment detail page	Complete
Appointment edit/reschedule	Complete
Appointment status history	Complete
Public lead API	Complete
Public appointment API	Complete
Public slots API	Complete
Public business config API	Complete
New Business Setup Checklist

Use this checklist for every new business.

Supabase Setup
Create new Supabase project.
Disable public signup if required.
Disable email confirmation if using manual accounts.
Add superadmin manually in Supabase Auth.
Add owner manually in Supabase Auth.
Run database migrations.
Verify tables are created.
Verify profiles rows exist for owner and superadmin.
Verify permissions and role permissions are seeded.
Admin Dashboard Setup
Clone/reuse admin dashboard code.
Add admin .env.local.
Add Supabase URL.
Add Supabase anon key.
Add Supabase service role key.
Add website API keys.
Run local build.
Deploy admin dashboard.
Login as superadmin.
Login as owner.
Business Configuration
Open super admin dashboard.
Update business name.
Update short name.
Update logo URL.
Update favicon URL.
Update theme color.
Update contact email.
Update contact phone.
Update address.
Update subscription settings.
Update feature settings.
Business Data Setup
Add business hours.
Add service areas.
Add services.
Add staff/admin users.
Configure roles and permissions.
Test permission override.
Test logout/login with different users.
Website Setup
Add website .env.local.
Add ADMIN_API_URL.
Add config API key.
Add lead API key.
Add appointment API key.
Connect business config API.
Connect lead form.
Connect appointment slots API.
Connect appointment submit API.
Deploy website.
Final Testing
Test business config load.
Test lead form.
Test customer auto-create.
Test appointment slots.
Test appointment submit.
Test invalid appointment time.
Test double booking prevention.
Test dashboard notification.
Test activity logs.
Test customer detail page.
Test lead detail page.
Test appointment detail page.
Test status update.
Test reschedule.
Test role permissions.
Production Security Notes

Do not expose these in browser:

SUPABASE_SERVICE_ROLE_KEY
WEBSITE_CONFIG_API_KEY
WEBSITE_LEAD_API_KEY
WEBSITE_APPOINTMENT_API_KEY

Best production pattern:

Website frontend
      ↓
Website server route
      ↓
Admin public API
      ↓
Supabase

Avoid this in production:

Website frontend directly calls admin API with visible API key

Direct browser calls are okay only for quick local testing.

Recommended Next Improvements
Improvement	Purpose
Dashboard analytics	Real counts for leads, customers, appointments
Website content pages	FAQs, offers, gallery, testimonials
Appointment blackout dates	Block holidays/special days
Staff assignment	Assign leads/appointments to staff
Email notifications	Send email to owner/admin
Export CSV	Export leads/customers
Better subscription lock	Fully block expired accounts
Super admin polish	Cleaner business control panel
Deployment checklist docs	Repeatable launch process

Done. Ye docs ab future business setup ke liye main reference ban jayegi. Next step me hum **dashboard analytics real data** start kar sakte hain: total leads, customers, appointments, pending appointments, today leads, recent activity.



is sara content ko ak md file ka format maan do
muja downloadable md file chahia complete
