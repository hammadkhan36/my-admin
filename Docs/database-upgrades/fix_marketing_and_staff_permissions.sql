  -- Upgrade for an EXISTING database: BUG-01 (managers/supervisors can open Offers and Coupons)
  -- and BUG-03 (staff.delete permission exists; password reset uses staff.reset_password).
  -- Safe to run more than once. Run in the Supabase SQL Editor. Do NOT run fresh-install.sql on an existing project.
  -- staff.delete is created but NOT granted to any role: only owner/superadmin can delete members unless
  -- you add a per-user override in Team -> Permissions.
  BEGIN;

  INSERT INTO public.permissions(permission_key, feature_key, action, description) VALUES
    ('staff.reset_password', 'staff', 'reset_password', 'Reset a member password'),
    ('staff.delete', 'staff', 'delete', 'Delete team members')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.role_permissions(role, permission_key, allowed) VALUES
    ('admin', 'staff.reset_password', true),
    ('manager', 'offers.view', true),
    ('manager', 'coupons.view', true),
    ('supervisor', 'offers.view', true),
    ('supervisor', 'coupons.view', true)
  ON CONFLICT DO NOTHING;

  COMMIT;
