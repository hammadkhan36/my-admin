# Authentication, Roles and Permissions

## Deployment model

This repository is a reusable single-business dashboard template. Every client receives a separate website, dashboard deployment and Supabase project. Data from different businesses is never stored in the same Supabase database.

## Fixed roles

| Role | Creation | Default authority |
| --- | --- | --- |
| Super Admin | Manual setup only | Entire deployment, subscription and feature control |
| Owner | Manual setup only | Full business access within enabled features |
| Admin | Dashboard | Business operations, team and permission overrides |
| Manager | Dashboard | CRM and appointment operations |
| Supervisor | Dashboard | Monitor and update operational work |
| Staff | Dashboard | Conservative day-to-day access |

`superadmin` and `owner` are limited to one profile each by partial unique indexes. They must never be offered in the dashboard member-creation form.

## Hybrid permission resolution

1. The account must be authenticated and active.
2. Super Admin and Owner receive all business permissions.
3. For other roles, a user-specific override wins when present.
4. Otherwise, the predefined role permission is used.
5. The related feature must also be enabled before its navigation or functionality is exposed.

Permission keys use `feature.action`, for example `leads.view`, `leads.update`, `staff.create` and `roles.manage_overrides`.

## Security boundaries

- Browser redirects and hidden sidebar links are user experience only.
- Server layouts verify the authenticated user and role.
- Every Server Action must call `requirePermission()` before a sensitive mutation.
- Supabase RLS is the final database boundary.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never use the `NEXT_PUBLIC_` prefix.
- Public signup, email confirmation and password recovery are not part of this product.
- Super Admin and Owner are provisioned manually; other accounts are created by an authorized server action with `email_confirm: true`.

## Initial Supabase setup

1. Create a new Supabase project.
2. Run `supabase/migrations/001_auth_roles_permissions.sql` in SQL Editor.
3. In Authentication settings, disable public user signup and email confirmation for this private dashboard.
4. Add the project URL, anon key and service-role key to `.env.local`.
5. In Authentication > Users, manually create the Super Admin and Owner with strong passwords and auto-confirm enabled.
6. Their profile rows are created automatically as `staff`. Promote them once using SQL:

```sql
update public.profiles
set role = 'superadmin', full_name = 'Platform Super Admin'
where email = 'YOUR_SUPER_ADMIN_EMAIL';

update public.profiles
set role = 'owner', full_name = 'Business Owner'
where email = 'OWNER_EMAIL';
```

7. Log in through the normal `/` login page. Super Admin is redirected to `/super-admin/dashboard`; every other active role goes to `/dashboard`.

## Renewal-code security

Plain renewal codes are not stored or returned to the browser. `set_renewal_code` stores a bcrypt hash and `renew_subscription` validates an entered code inside PostgreSQL. This replaces the earlier client-side comparison that exposed the code to authenticated users.

## Next implementation

- Secure dashboard member creation
- Deactivate/reactivate member
- Administrative password reset
- Per-member permission override UI
- Route-level permission guards for individual modules
- Audit-log entries for every administrative action
