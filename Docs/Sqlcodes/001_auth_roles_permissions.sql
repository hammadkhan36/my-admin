-- Local Business Admin: single-business authentication and authorization foundation.
-- Run this once in a NEW/EMPTY Supabase project.

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum (
    'superadmin',
    'owner',
    'admin',
    'manager',
    'supervisor',
    'staff'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'staff',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Each deployed project represents one business and has one platform operator and owner.
create unique index if not exists profiles_one_superadmin
  on public.profiles (role) where role = 'superadmin';
create unique index if not exists profiles_one_owner
  on public.profiles (role) where role = 'owner';

create table if not exists public.permissions (
  permission_key text primary key,
  feature_key text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (feature_key, action)
);

create table if not exists public.role_permissions (
  role public.app_role not null,
  permission_key text not null references public.permissions(permission_key) on delete cascade,
  allowed boolean not null default true,
  primary key (role, permission_key)
);

create table if not exists public.user_permission_overrides (
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission_key text not null references public.permissions(permission_key) on delete cascade,
  allowed boolean not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, permission_key)
);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  short_name text,
  logo_url text,
  favicon_url text,
  theme_color text not null default '#2563eb',
  contact_email text,
  contact_phone text,
  address text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_settings (
  feature_key text primary key,
  enabled boolean not null default true,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  plan text not null default 'monthly'
    check (plan in ('one-time', 'monthly', 'half-yearly', 'yearly', 'lifetime')),
  start_date date,
  end_date date,
  grace_period_days integer not null default 7 check (grace_period_days between 0 and 90),
  is_active boolean not null default true,
  renewal_code_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'staff'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists overrides_set_updated_at on public.user_permission_overrides;
create trigger overrides_set_updated_at before update on public.user_permission_overrides
  for each row execute function public.set_updated_at();
drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();
drop trigger if exists feature_settings_set_updated_at on public.feature_settings;
create trigger feature_settings_set_updated_at before update on public.feature_settings
  for each row execute function public.set_updated_at();
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = auth.uid() and is_active = true;
$$;

create or replace function public.has_permission(requested_permission text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  active_role public.app_role;
  override_value boolean;
  role_value boolean;
begin
  select role into active_role
  from public.profiles
  where id = auth.uid() and is_active = true;

  if active_role is null then return false; end if;
  if active_role in ('superadmin', 'owner') then return true; end if;

  select allowed into override_value
  from public.user_permission_overrides
  where user_id = auth.uid() and permission_key = requested_permission;

  if override_value is not null then return override_value; end if;

  select allowed into role_value
  from public.role_permissions
  where role = active_role and permission_key = requested_permission;

  return coalesce(role_value, false);
end;
$$;

create or replace function public.get_my_permissions()
returns table(permission_key text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.permission_key
  from public.permissions p
  where public.has_permission(p.permission_key)
  order by p.permission_key;
$$;

create or replace function public.set_renewal_code(new_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'superadmin' then
    raise exception 'Forbidden';
  end if;
  if length(trim(new_code)) < 8 then
    raise exception 'Renewal code must contain at least 8 characters';
  end if;

  update public.subscriptions
  set renewal_code_hash = public.crypt(trim(new_code), public.gen_salt('bf'));
end;
$$;

create or replace function public.renew_subscription(code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_subscription public.subscriptions%rowtype;
  next_end_date date;
begin
  if auth.uid() is null then return false; end if;

  select * into current_subscription from public.subscriptions limit 1;
  if current_subscription.id is null or current_subscription.renewal_code_hash is null then
    return false;
  end if;
  if public.crypt(trim(code), current_subscription.renewal_code_hash) <> current_subscription.renewal_code_hash then
    return false;
  end if;

  next_end_date := case current_subscription.plan
    when 'monthly' then current_date + interval '1 month'
    when 'half-yearly' then current_date + interval '6 months'
    when 'yearly' then current_date + interval '1 year'
    when 'one-time' then current_date + interval '1 year'
    else date '2099-12-31'
  end;

  update public.subscriptions
  set start_date = current_date, end_date = next_end_date, is_active = true
  where id = current_subscription.id;

  insert into public.audit_logs (actor_id, event_type, target_type, target_id)
  values (auth.uid(), 'subscription.renewed', 'subscription', current_subscription.id::text);

  return true;
end;
$$;

-- Every sidebar feature gets a view permission.
insert into public.permissions (permission_key, feature_key, action, description)
select feature_key || '.view', feature_key, 'view', 'View ' || feature_key
from unnest(array[
  'dashboard','leads','customers','appointments','calendar','campaigns','offers',
  'coupons','referrals','reviews','testimonials','gallery','services','products',
  'pages','faqs','media','seo','analytics','trafficSources','reports',
  'businessProfile','serviceAreas','businessHours','staff','roles','activityLogs',
  'settings','forms','followUps','leadSources','notifications'
]) as feature_key
on conflict (permission_key) do nothing;

insert into public.permissions (permission_key, feature_key, action, description) values
  ('leads.create','leads','create','Create leads'),
  ('leads.update','leads','update','Update leads and status'),
  ('leads.delete','leads','delete','Delete leads'),
  ('customers.create','customers','create','Create customers'),
  ('customers.update','customers','update','Update customers'),
  ('customers.delete','customers','delete','Delete customers'),
  ('appointments.create','appointments','create','Create appointments'),
  ('appointments.update','appointments','update','Update appointments'),
  ('appointments.cancel','appointments','cancel','Cancel appointments'),
  ('services.manage','services','manage','Manage services'),
  ('staff.create','staff','create','Create team members'),
  ('staff.update','staff','update','Update team members'),
  ('staff.deactivate','staff','deactivate','Deactivate team members'),
  ('staff.reset_password','staff','reset_password','Reset a member password'),
  ('roles.manage_overrides','roles','manage_overrides','Manage member permission overrides'),
  ('businessProfile.update','businessProfile','update','Update business profile'),
  ('businessHours.update','businessHours','update','Update business hours'),
  ('serviceAreas.update','serviceAreas','update','Update service areas'),
  ('settings.update','settings','update','Update business settings')
on conflict (permission_key) do nothing;

-- Admin can manage all business operations and team members.
insert into public.role_permissions (role, permission_key, allowed)
select 'admin', permission_key, true from public.permissions
on conflict (role, permission_key) do update set allowed = excluded.allowed;

-- Manager handles daily CRM and appointments, but not users, roles or sensitive settings.
insert into public.role_permissions (role, permission_key, allowed)
select 'manager', permission_key, true from public.permissions
where feature_key in (
  'dashboard','leads','customers','appointments','calendar','services','forms',
  'followUps','leadSources','notifications','analytics','reports'
)
on conflict (role, permission_key) do update set allowed = excluded.allowed;

-- Supervisor monitors and updates operational records.
insert into public.role_permissions (role, permission_key, allowed)
select 'supervisor', permission_key, true from public.permissions
where permission_key in (
  'dashboard.view','leads.view','leads.update','customers.view','customers.update',
  'appointments.view','appointments.update','calendar.view','services.view',
  'followUps.view','notifications.view','analytics.view','reports.view'
)
on conflict (role, permission_key) do update set allowed = excluded.allowed;

-- Staff receives conservative defaults; individual overrides expand access when needed.
insert into public.role_permissions (role, permission_key, allowed)
select 'staff', permission_key, true from public.permissions
where permission_key in (
  'dashboard.view','leads.view','leads.create','leads.update','customers.view',
  'customers.create','appointments.view','appointments.create','calendar.view',
  'services.view','notifications.view'
)
on conflict (role, permission_key) do update set allowed = excluded.allowed;

insert into public.business_settings (business_name, short_name)
select 'Company Name', 'Company'
where not exists (select 1 from public.business_settings);

insert into public.subscriptions (plan, start_date, end_date, grace_period_days, is_active)
select 'lifetime', current_date, date '2099-12-31', 7, true
where not exists (select 1 from public.subscriptions);

insert into public.feature_settings (feature_key, enabled, locked)
select feature_key, true, false
from (select distinct feature_key from public.permissions) features
on conflict (feature_key) do nothing;

alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permission_overrides enable row level security;
alter table public.business_settings enable row level security;
alter table public.feature_settings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

grant select on public.profiles, public.permissions, public.role_permissions,
  public.user_permission_overrides, public.business_settings,
  public.feature_settings, public.audit_logs
to authenticated;
grant select (id, plan, start_date, end_date, grace_period_days, is_active, created_at, updated_at)
on public.subscriptions to authenticated;
grant update on public.business_settings, public.feature_settings, public.subscriptions
to authenticated;
grant usage, select on sequence public.audit_logs_id_seq to authenticated;

create policy "profiles_read_self_or_team" on public.profiles for select to authenticated
using (id = auth.uid() or public.has_permission('staff.view'));
create policy "permissions_read_authenticated" on public.permissions for select to authenticated using (true);
create policy "role_permissions_read_authenticated" on public.role_permissions for select to authenticated using (true);
create policy "overrides_read_self_or_manager" on public.user_permission_overrides for select to authenticated
using (user_id = auth.uid() or public.has_permission('roles.manage_overrides'));
create policy "business_settings_read_authenticated" on public.business_settings for select to authenticated using (true);
create policy "business_settings_update_authorized" on public.business_settings for update to authenticated
using (public.has_permission('businessProfile.update'))
with check (public.has_permission('businessProfile.update'));
create policy "features_read_authenticated" on public.feature_settings for select to authenticated using (true);
create policy "features_superadmin_update" on public.feature_settings for update to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');
create policy "subscriptions_read_authenticated" on public.subscriptions for select to authenticated using (true);
create policy "subscriptions_superadmin_update" on public.subscriptions for update to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');
create policy "audit_logs_read_authorized" on public.audit_logs for select to authenticated
using (public.has_permission('activityLogs.view'));

revoke all on function public.set_renewal_code(text) from public;
revoke all on function public.renew_subscription(text) from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.get_my_permissions() to authenticated;
grant execute on function public.set_renewal_code(text) to authenticated;
grant execute on function public.renew_subscription(text) to authenticated;
