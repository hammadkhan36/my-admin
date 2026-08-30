# Project Status

## Product model

- One reusable codebase
- One business per deployment
- Separate website, dashboard and Supabase project for every client
- Super Admin represents the platform/service provider
- Owner represents the client business

## Completed foundation

- Six fixed roles: Super Admin, Owner, Admin, Manager, Supervisor and Staff
- Hybrid role defaults plus individual user overrides at database level
- Automatic profile creation after an Auth user is created
- Server-protected business and Super Admin layouts
- Supabase session refresh through Next.js 16 `proxy.ts`
- Feature + permission filtered sidebar
- Real Supabase-backed team list
- Server-only Admin API member creation
- Member activation/deactivation foundation
- RLS policies for authentication/configuration tables
- Hashed renewal codes and database-side renewal validation
- Auth and setup documentation

## Current implementation boundary

The migration is prepared but has not been applied to a live Supabase project from this workspace. The application requires real values in `.env.local` before live authentication can be tested.

## Next milestone

1. Apply migration to the selected Supabase project.
2. Create and promote the initial Super Admin and Owner.
3. Test login and role redirects with live credentials.
4. Add administrative password reset.
5. Add per-member permission override UI.
6. Add permission checks to each module mutation and its RLS policies.
7. Connect activity logs and notifications to auth/team events.
