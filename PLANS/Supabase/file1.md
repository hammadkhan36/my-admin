-- Profiles table (user details + role)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text not null default 'staff', -- 'admin', 'superadmin', 'staff'
  business_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Business settings (branding, contact, etc.)
create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  business_name text,
  short_name text,
  logo_url text,
  favicon_url text,
  theme_color text,
  contact_email text,
  contact_phone text,
  address text,
  social_links jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Features configuration (which modules enabled)
create table public.feature_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  feature_key text not null,
  enabled boolean default true,
  locked boolean default false,
  unlock_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (business_id, feature_key)
);

-- Subscription info
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  plan text not null default 'monthly',
  start_date date,
  end_date date,
  grace_period_days int default 7,
  is_active boolean default true,
  renewal_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Super admin credentials (optional, but we'll use profiles.role)
-- No separate table needed



ya initial maan haam na run kia taah setup ka lia 













-- 1. Profile row (user UUID replace karo)
insert into public.profiles (id, email, full_name, role)
values
  ('111c16d7-54dd-4a8f-92f4-27adf45eb622', 'hammadtahir16333@gmail.com', 'Super Admin', 'superadmin');

-- 2. Business settings
insert into public.business_settings (
  business_name, short_name, logo_url, favicon_url, theme_color,
  contact_email, contact_phone, address, social_links
) values (
  'Acme Inc.', 'Acme', '/logo.svg', '/favicon.ico', '#2563eb',
  'support@acme.com', '+92 300 1234567', '123 Main Street, Islamabad',
  '{"facebook": "https://facebook.com/acme", "instagram": "https://instagram.com/acme"}'
);

-- 3. Subscription (lifetime plan for no expiry)
insert into public.subscriptions (
  plan, start_date, end_date, grace_period_days, is_active, renewal_code
) values (
  'lifetime', '2024-01-01', '2099-12-31', 7, true, 'RENEW2024'
);

-- 4. Feature settings (saare modules)
insert into public.feature_settings (feature_key, enabled, locked, unlock_code) values
  ('dashboard', true, false, ''),
  ('leads', true, false, ''),
  ('customers', true, false, ''),
  ('appointments', true, true, 'APPT2024'),
  ('calendar', true, true, 'CAL2024'),
  ('campaigns', true, true, 'MKT2024'),
  ('offers', true, false, ''),
  ('coupons', true, false, ''),
  ('referrals', true, false, ''),
  ('reviews', true, false, ''),
  ('testimonials', true, false, ''),
  ('gallery', true, false, ''),
  ('services', true, false, ''),
  ('products', true, false, ''),
  ('pages', true, false, ''),
  ('faqs', true, false, ''),
  ('media', true, false, ''),
  ('seo', true, false, ''),
  ('analytics', true, false, ''),
  ('trafficSources', true, false, ''),
  ('reports', true, true, 'RPT2024'),
  ('businessProfile', true, false, ''),
  ('serviceAreas', true, false, ''),
  ('businessHours', true, false, ''),
  ('staff', true, false, ''),
  ('roles', true, false, ''),
  ('activityLogs', true, false, ''),
  ('notifications', true, false, ''),
  ('settings', true, false, '');


  ya data or super admin add karna ka lia run ki teh


  