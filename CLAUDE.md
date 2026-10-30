@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. For how this app pairs with the public website, see `../CLAUDE.md`.

## Commands

- `npm run dev` — dev server on port 3000 (the website expects admin here locally)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint-config-next`); `npx tsc --noEmit` — type check
- `npm run check:setup` — validates env var shape (Node 22+, loads `.env.local`, no network calls, never prints values)
- `npm run test:database` — builds `database/fresh-install.sql` + `defaults.sql` in PGlite (Postgres WASM) and checks schema/RLS/grants
- `npm run test:core` — unit tests for `lib/appointments/schedule.ts` and customer server actions
- Single test file: `node --test tests/<file>.test.cjs`

Tests are plain CommonJS using `node:test`; they transpile the TS source with `typescript` and run it in a `vm` context with mocked Supabase clients, so there is no Jest/Vitest config. CI (`.github/workflows/database-check.yml`) runs both test scripts plus `tsc --noEmit` on Node 22.

## Architecture

Admin dashboard / CRM for **one** local business (currently a dental clinic) and the backend API for its public website (`../business-website`). Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui (`components/ui/*`, built on `@base-ui/react`). Path alias `@/*` maps to the repo root. One deployment and one Supabase project per business.

### Routes
- `app/page.tsx` — login page (Supabase email/password via `components/login-form.tsx`).
- `app/(admin)/*` — the dashboard. `app/(admin)/layout.tsx` calls `requireProfile()` (redirects to `/?error=access_denied` if not logged in / inactive) and wraps everything in `AuthProvider` → `ConfigProviders` → `DashboardShell`. Sections: `dashboard`, `analytics`, `appointments`, `business`, `crm` (leads, customers, notifications, services, lead-sources, forms, follow-ups), `marketing` (offers, coupons, campaigns, referrals), `reputation` (reviews, testimonials, gallery), `website` (pages, faqs, forms, media, seo, services, products), `team` (staff, roles, permissions), `system` (settings, activity-logs), `profile`.
- `app/super-admin/*` — superadmin-only (`requireSuperAdmin()`): business settings, subscription, feature toggles.
- `app/api/public/*` — endpoints called server-to-server by the website, guarded by `x-api-key` (full map in `../CLAUDE.md`). They use the service-role client.
- `app/api/internal/email-dispatch` — cron endpoint (`Authorization: Bearer CRON_SECRET`) that claims one queued email via `claim_admin_emails` RPC and sends it through Resend with an idempotency key.
- `app/api/reports/export`, `app/api/contact-mode` — session-authenticated admin endpoints.

### Supabase clients (`lib/`)
- `supabase-server.ts` — anon key + cookies, RLS applies. Use for reading the current user and permission RPCs.
- `supabase-browser.ts` — client components.
- `supabase-admin.ts` — service-role key, `server-only`, bypasses RLS. Only use after an auth/permission check (server actions) or an API-key check (public API).

### Auth, roles, permissions
- `lib/auth/roles.ts`: roles `superadmin`, `owner`, `admin`, `manager`, `supervisor`, `staff`. `superadmin`/`owner` are provisioned manually (SQL `database/bootstrap-admin.sql`), the rest can be created from Team → Staff.
- `lib/auth/server.ts`: `getCurrentProfile` (cached, `profiles` table), `requireProfile`, `requireSuperAdmin`, `getCurrentPermissions` (RPC `get_my_permissions`), `requirePermission("leads.create")` (RPC `has_permission`; superadmin/owner always pass). Details: `Docs/AUTH_ROLES_PERMISSIONS.md`.

### Server actions pattern
Mutations live in `actions.ts` next to each page (`"use server"`): `requirePermission(...)` → zod-validate `FormData` → write with `createAdminClient()` → `logActivity(...)` / `createNotification(...)` → `revalidatePath(...)`. Return an action-state object (`lib/action-state.ts`) consumed by `useActionState` forms and `components/form-action-alert.tsx`. Pages read data directly in their server `page.tsx` with `createClient()` from `lib/supabase-server.ts` (RLS applies) after `requirePermission(...)`. The `lib/*-data.ts` files (`crm-data`, `appointment-data`, ...) are old mock data that nothing imports, so don't build on them.

### Feature flags and subscription
- Section layouts call `requireFeatureEnabled(key)` (`lib/features/server.ts`, reads `feature_settings`; superadmin bypasses). Keys in `lib/features-config.ts`.
- `lib/release-features.ts` hides unfinished modules (`campaigns`, `referrals`, `products`, `followUps`) from client navigation/settings — don't present them as working.
- Subscription expiry/grace period is client-side (`components/subscription-provider.tsx`, data from `subscriptions` table via `supabase-config-provider.tsx`).

### Website integration details
- Lead/appointment submissions are idempotent (`submission_id` + SHA-256 request fingerprint) and rate-limited per phone/email via `consume_submission_quota` — `lib/website/submissions.ts`.
- Public reviews and custom-form submissions use the same per-contact quota (`consumeContactQuota`). Coupon redeem is one atomic `redeem_coupon` RPC (service-role only); validate/redeem return one generic error. Shared JSON/size/URL helpers: `lib/website/request.ts`. There is no IP quota yet; add it together with the website proxy when reviews/forms/coupons come back.
- Contacts are normalized and matched/created as customers by `lib/contacts/server.ts` (`resolveCustomer`, `validateContact`). `contact_mode` (`phone` | `email`) in business settings decides which contact field is required, and is exposed to the website via `/api/public/contact-config`.
- Appointment availability: `lib/appointments/schedule.ts` (pure, tested) + `lib/appointments/availability.ts` (business hours, timezone, existing bookings). The DB also has an exclusion constraint against overlapping bookings (`23P01`).

### Database
Installed via Supabase SQL Editor, not CLI migrations: `database/fresh-install.sql` → `database/defaults.sql` → `database/bootstrap-admin.sql` (see `database/README.md`, Roman Urdu). Never run the fresh installer on an existing project; upgrades for the existing clinic are in `Docs/database-upgrades/*.sql`. `Docs/Sqlcodes/` is old reference only. When changing schema, update `fresh-install.sql` and keep `npm run test:database` passing.

### Env vars (names only; see `.env.example`)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WEBSITE_CONFIG_API_KEY`, `WEBSITE_LEAD_API_KEY`, `WEBSITE_APPOINTMENT_API_KEY`, `WEBSITE_ANALYTICS_API_KEY`, and for email `ADMIN_SITE_URL` (HTTPS), `RESEND_API_KEY`, `RESEND_FROM`, `CRON_SECRET`.

### Legacy / leftovers
- `lib/master-config.ts` is mostly commented-out old hardcoded config; `lib/site-config.ts` still has placeholder branding ("Company XYZ") used on the login page/sidebar.
- `PLANS/` and parts of `Docs/` are planning notes (some Roman Urdu) and may be outdated; `Docs/website-integration copy.md` is a duplicate.
