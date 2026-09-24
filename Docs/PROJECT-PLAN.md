# Reusable Business Platform — Project Plan

Reviewed: 2026-09-24
Status: Existing implementation under verification

## Mission

Maintain a reusable admin panel and website foundation.
Launch each new business by configuring its database,
business information, enabled modules and website design.

Each client receives:
- A separate Supabase project.
- A separate admin deployment.
- A separate website deployment.

Shared functionality should not require rewriting for each client.

## Current Source Baseline

Admin repository: hammadkhan36/my-admin
Branch: master
Commit: cdc2f49bb6678e09ee7e753099db2c821d2e6ba6

Website repository: hammadkhan36/business-website
Branch: master
Commit: 84aee7fb44e14659929cc2e9a7fd64711b2cdb5c

Existing feature branches contain additional work.
Review and reuse relevant changes individually.
Do not treat unmerged work or the earlier ZIP as deployed.

## Database Verification

The currently accessible Supabase project is deskcrafts Project.
Its public schema does not match the SaaS admin application.

The actual SaaS database must be identified and inspected before:
- Preparing corrective SQL.
- Creating the reusable schema baseline.
- Running clinic seed data.
- Claiming live integrations are complete.

Do not modify another project's tables to make them fit this app.

## Architecture Decisions

1. Keep one shared admin codebase and website integration layer.
2. Use a separate database per business.
3. Keep private API keys on servers.
4. Website browser requests go through website server endpoints.
5. Website server communicates with admin public APIs.
6. Admin APIs validate requests before database operations.
7. Keep business configuration separate from UI components.
8. Use admin-managed content as the source for editable fields.
9. Fallback content must never belong to another business.
10. Optional features must be enforced on the server.
11. Analytics must follow the visitor's consent choice.
12. Appointment requests are not confirmed bookings.

## Priority Backlog

### P0 — Foundation and Data Safety

- Identify the actual SaaS Supabase project.
- Inspect schema, constraints, RLS, grants and functions.
- Reconcile renewal frontend with hashed-code database RPCs.
- Create a versioned, reproducible database baseline.
- Preserve all existing business data.

### P1 — Reliable Shared Functionality

- Implement and verify session refresh.
- Verify role and permission enforcement.
- Enforce module availability in public APIs.
- Define the shared website API contract.
- Add consistent submission validation and error handling.
- Connect website services, FAQs, hours and contact data.
- Consolidate consent-aware analytics.
- Correct appointment timezone, duration and capacity checks.
- Add database-level protection for concurrent booking conflicts.

### P2 — Business Launch

- Complete Dr Yousaf clinic branding and content.
- Connect metadata, canonical URLs and published sitemap entries.
- Verify mobile layouts and accessibility.
- Verify notifications and configure email delivery if enabled.
- Test production configuration and deployment.

## Documentation Structure

- PROJECT-PLAN.md: mission, architecture and priorities.
- DATABASE.md: schema, migrations, RLS and seed procedure.
- WEBSITE-API.md: endpoints, payloads, responses and errors.
- NEW-BUSINESS-SETUP.md: repeatable client onboarding.
- TESTING.md: verification steps and expected results.

Keep authoritative documentation in the admin repository.
The website README should reference the matching documentation version.

## Definition of Ready for a New Business

A new business is ready only when:
- Its database can be created from documented migrations.
- Initial accounts and permissions work.
- Business information and enabled features are configured.
- Website forms reach the correct business database.
- Disabled modules reject requests.
- Analytics respects consent.
- Appointment handling passes conflict tests.
- Builds and relevant checks pass.
- Desktop and mobile journeys are reviewed.
- Production domains and indexing settings are verified.

## Working Method

The assistant reviews files and proposes changes.
The user applies repository and database changes.

Each implementation batch includes:
- Repository and exact file path.
- Create or replace instruction.
- Complete file contents.
- Required database dependencies.
- Verification commands and expected results.
- Matching documentation updates.

A feature is marked verified only after its relevant checks pass.
