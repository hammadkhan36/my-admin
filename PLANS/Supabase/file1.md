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