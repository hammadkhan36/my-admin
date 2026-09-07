# Website Integration Guide

This admin panel exposes secure public APIs for the reusable business website starter.

## Purpose

The website should never connect directly with the Supabase service role key.

Instead, the flow is:

```txt
business-website
-> my-admin public API
-> Supabase
-> admin dashboard


Required Admin Environment Variables

Add these to my-admin/.env.local:

WEBSITE_CONFIG_API_KEY=
WEBSITE_LEAD_API_KEY=
WEBSITE_APPOINTMENT_API_KEY=
WEBSITE_ANALYTICS_API_KEY=

These keys must match the website .env.local.




Public API Routes
| Feature           | Admin API Route                  | Required Key                  |
| ----------------- | -------------------------------- | ----------------------------- |
| Business config   | `/api/public/business-config`    | `WEBSITE_CONFIG_API_KEY`      |
| Pages             | `/api/public/pages`              | `WEBSITE_CONFIG_API_KEY`      |
| Forms list        | `/api/public/forms`              | `WEBSITE_CONFIG_API_KEY`      |
| Form submit       | `/api/public/forms/submit`       | `WEBSITE_CONFIG_API_KEY`      |
| Reviews           | `/api/public/reviews`            | `WEBSITE_CONFIG_API_KEY`      |
| Coupon validate   | `/api/public/coupons/validate`   | `WEBSITE_CONFIG_API_KEY`      |
| Coupon redeem     | `/api/public/coupons/redeem`     | `WEBSITE_CONFIG_API_KEY`      |
| Leads             | `/api/public/leads`              | `WEBSITE_LEAD_API_KEY`        |
| Appointments      | `/api/public/appointments`       | `WEBSITE_APPOINTMENT_API_KEY` |
| Appointment slots | `/api/public/appointments/slots` | `WEBSITE_APPOINTMENT_API_KEY` |
| Analytics events  | `/api/public/analytics/events`   | `WEBSITE_ANALYTICS_API_KEY`   |



## Website Event Tracking

Analytics events are stored in:

public.website_events

Supported event types:

page_view
call_click
whatsapp_click
map_click
booking_click
lead_submit
appointment_submit
coupon_validate
coupon_redeem
review_submit
form_submit




## Website Events SQL

Run the SQL file:

Docs/sql/website-events.sql

This creates:

public.website_events

and adds authenticated dashboard read policy:

analytics.view

Public website does not insert directly into Supabase. It inserts through:

/api/public/analytics/events




## Security Rules
Do not expose SUPABASE_SERVICE_ROLE_KEY to the website browser.
Do not use NEXT_PUBLIC_ prefix for private API keys.
Website should call its own local proxy routes first.
Admin public APIs must validate x-api-key.
Public website should only use server-side env keys.
Local Development

Admin:

cd "E:\Github\local business website\my-admin"
npm run dev

Website:

cd "E:\Github\business-website"
npm run dev -- -p 3001

Admin URL:

http://localhost:3000

Website URL:

http://localhost:3001






## Verification Checklist

Business config loads on website.
Page views save in website_events.
Button clicks save in website_events.
Lead form creates lead and customer.
Appointment form creates pending appointment.
Coupon validate checks code without increasing used_count.
Coupon redeem increases used_count.
Review submit creates pending review.
Custom form submit creates form submission.
Admin analytics page shows visits/clicks/conversions.
Traffic sources page shows Direct/UTM/referrer data.
Reports page downloads CSV exports.




Related Admin Pages
/analytics
/analytics/traffic-sources
/analytics/reports
/crm/leads
/appointments
/website/forms
/reputation/reviews
/marketing/coupons
/system/activity-logs