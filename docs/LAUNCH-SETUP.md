# Launch setup — read this first

## Current status
Code builds locally. Customer and lead action tests pass. Database contact quotas and appointment conflict constraints were tested with rollback queries. These checks do not prove live deployment, staff login, or inbox delivery.

Each business needs its own Supabase project, admin deployment, website deployment and secrets. Never connect a new client's deployment to another client's project.

## 1. Connect the existing database
For the existing clinic, use its existing Supabase project. Do not rerun old SQL snippets over it. The new contact settings, email outbox, submission idempotency, appointment overlap protection and contact quota upgrades have already been applied.

For a completely new business, use database/fresh-install.sql, database/defaults.sql and database/bootstrap-admin.sql from the admin repository, following database/README.md. The installer is tested in isolated Postgres with a Supabase Auth SQL fixture. Real hosted Auth and deployment still require the acceptance checks below. Do not combine it with old Docs/Sqlcodes snippets.

## 2. Configure the admin deployment
Set these in your hosting provider's environment settings; redeploy after changing them:

- NEXT_PUBLIC_SUPABASE_URL: this business's project URL.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: this business's publishable/anon key.
- SUPABASE_SERVICE_ROLE_KEY: server-only service role key (never NEXT_PUBLIC).
- WEBSITE_LEAD_API_KEY, WEBSITE_APPOINTMENT_API_KEY, WEBSITE_CONFIG_API_KEY, WEBSITE_ANALYTICS_API_KEY: separate long random secrets; corresponding values must match the website deployment.
- ADMIN_SITE_URL: HTTPS admin origin, no page path.
- CRON_SECRET: separate random secret for the email worker.
- RESEND_API_KEY: server-only Resend API key.
- RESEND_FROM: sender address on a domain verified in Resend.

Do not paste secret values into documentation, GitHub or browser code.

## 3. Configure the website deployment
- NEXT_PUBLIC_SITE_URL: exact public website HTTPS origin.
- ADMIN_API_URL: HTTPS admin origin.
- The four matching WEBSITE_*_API_KEY values above: server environment only.
- LEAD_FORM_ENABLED=true and APPOINTMENT_FORM_ENABLED=true after admin settings are ready.

Change content/business.ts for identity/contact/navigation; content/booking.ts for booking wording. Other content files hold page copy. Components and app pages control appearance. Keep business data separate from presentation code.

## 4. Prepare the business in the admin
Create/verify the staff account and permissions. In settings choose phone-primary or email-primary contact mode. In email mode, phone can be empty; in phone mode, email can be empty. Optional contact fields must still be valid.

Set the business timezone, weekly opening hours, service durations and active/website-visible services. Booking currently uses ONE shared calendar per business, not multiple independent dentists/chairs. A pending or approved booking blocks its full duration. Adjacent bookings are allowed. Overnight opening hours are not supported.

## 5. Enable email delivery
Set the recipient address and switch on only the notification events needed in communication settings. Schedule a server request to /api/internal/email-dispatch with Authorization: Bearer <CRON_SECRET>. Each call processes at most ONE email; choose worker frequency/capacity for expected traffic and monitor the queue.

No scheduler or live Resend delivery was verified in this workspace. Configure hosting first, then submit an explicitly authorized test enquiry. Check the admin record, outbox and recipient inbox. An outbox status of accepted means Resend accepted it; it does not prove inbox delivery. Retries reuse a stable provider idempotency key. Do not reset failed jobs blindly after the retry window.

## 6. Required live acceptance checks
1. Log in as intended staff; verify unauthorized users cannot open protected pages or write records.
2. Submit website enquiries and bookings in phone and email modes. Confirm exactly one matching admin record and correct customer link.
3. Retry an uncertain submission without changing details; confirm it does not create a duplicate.
4. Try simultaneous bookings for the same time; only one can reserve the calendar.
5. Test invalid/past/out-of-hours bookings and contact validation messages.
6. Verify selected email events arrive and disabled events do not queue.
7. Accept/decline analytics consent and verify the corresponding analytics behavior.
8. Check mobile layout, navigation, clinic contact details and deployment logs.

Repeated-contact protection allows 10 requests per contact, per action, per hour. This is not a complete bot protection system; configure hosting-level traffic controls for public launch.

## Still required before claiming production-ready
Actual hosting environment configuration, worker scheduling, authenticated live acceptance tests, confirmed email delivery, and a hosted new-project smoke test before selling this as an immediately reusable template. The schema installer and local database tests are now included in the admin repository. Do not advertise unverified modules as working.

## Current release scope
Campaigns, referrals, product catalogue and scheduled follow-ups are unfinished and hidden from client navigation/settings. Their old demo pages return 404. Do not advertise them as working features. Calendar now shows actual appointments for a selected business date; availability uses the real business-hours editor.
