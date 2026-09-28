-- Fresh Supabase project only. Never run over an existing business database.

-- Schema-only baseline; no clinic customers, users, keys, bookings or emails.

BEGIN;

SET LOCAL search_path = public, extensions;

SET LOCAL check_function_bodies = off;

DO $$ BEGIN IF to_regclass('public.profiles') IS NOT NULL THEN RAISE EXCEPTION 'Existing application found. Use reviewed upgrades, not the fresh installer.'; END IF; END $$;

CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS app_private;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA app_private TO service_role;

CREATE TYPE "public"."app_role" AS ENUM ('superadmin', 'owner', 'admin', 'manager', 'supervisor', 'staff');

CREATE SEQUENCE "public"."audit_logs_id_seq" AS bigint START WITH 1 INCREMENT BY 1;

CREATE TABLE "public"."email_outbox" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "event_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "recipient_email" text NOT NULL,
  "subject" text NOT NULL,
  "admin_path" text NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "available_at" timestamp with time zone DEFAULT now() NOT NULL,
  "first_attempt_at" timestamp with time zone,
  "lease_until" timestamp with time zone,
  "lease_token" uuid,
  "request_body" jsonb,
  "provider_id" text,
  "last_error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "accepted_at" timestamp with time zone
);

CREATE TABLE "public"."profiles" (
  "id" uuid NOT NULL,
  "email" text NOT NULL,
  "full_name" text,
  "avatar_url" text,
  "role" app_role DEFAULT 'staff'::app_role NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."permissions" (
  "permission_key" text NOT NULL,
  "feature_key" text NOT NULL,
  "action" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."role_permissions" (
  "role" app_role NOT NULL,
  "permission_key" text NOT NULL,
  "allowed" boolean DEFAULT true NOT NULL
);

CREATE TABLE "public"."user_permission_overrides" (
  "user_id" uuid NOT NULL,
  "permission_key" text NOT NULL,
  "allowed" boolean NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."audit_logs" (
  "id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  "actor_id" uuid,
  "event_type" text NOT NULL,
  "target_type" text,
  "target_id" text,
  "details" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."feature_settings" (
  "feature_key" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "locked" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."subscriptions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "plan" text DEFAULT 'monthly'::text NOT NULL,
  "start_date" date,
  "end_date" date,
  "grace_period_days" integer DEFAULT 7 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "renewal_code_hash" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."lead_notes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "note" text NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."leads" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid,
  "name" text NOT NULL,
  "phone" text,
  "email" text,
  "service" text,
  "message" text,
  "source" text DEFAULT 'manual'::text NOT NULL,
  "status" text DEFAULT 'new'::text NOT NULL,
  "priority" text DEFAULT 'normal'::text NOT NULL,
  "page_url" text,
  "referrer" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "assigned_to" uuid,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "submission_id" uuid,
  "request_fingerprint" text
);

CREATE TABLE "public"."faqs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."business_hours" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "day_of_week" integer NOT NULL,
  "day_name" text NOT NULL,
  "opens_at" time without time zone,
  "closes_at" time without time zone,
  "is_closed" boolean DEFAULT false NOT NULL,
  "is_24h" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."service_areas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "area_name" text NOT NULL,
  "city" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."services" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "price" numeric(10,2),
  "duration_minutes" integer,
  "show_on_website" boolean DEFAULT true NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."appointment_status_history" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "appointment_id" uuid NOT NULL,
  "old_status" text,
  "new_status" text NOT NULL,
  "changed_by" uuid,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."testimonials" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "customer_name" text NOT NULL,
  "customer_role" text,
  "quote" text NOT NULL,
  "rating" integer,
  "image_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."media_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text,
  "description" text,
  "image_url" text NOT NULL,
  "alt_text" text,
  "category" text DEFAULT 'gallery'::text NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."appointments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid,
  "lead_id" uuid,
  "service_id" uuid,
  "customer_name" text NOT NULL,
  "customer_phone" text,
  "customer_email" text,
  "appointment_date" date NOT NULL,
  "appointment_time" time without time zone NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "notes" text,
  "source" text DEFAULT 'manual'::text NOT NULL,
  "assigned_to" uuid,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "submission_id" uuid,
  "request_fingerprint" text,
  "duration_minutes" integer DEFAULT 30 NOT NULL
);

CREATE TABLE "public"."offers" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "discount_label" text,
  "starts_at" date,
  "ends_at" date,
  "cta_label" text,
  "cta_url" text,
  "image_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."coupons" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "discount_type" text DEFAULT 'percent'::text NOT NULL,
  "discount_value" numeric(10,2) DEFAULT 0 NOT NULL,
  "starts_at" date,
  "ends_at" date,
  "usage_limit" integer,
  "used_count" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."reviews" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid,
  "customer_name" text NOT NULL,
  "customer_phone" text,
  "customer_email" text,
  "rating" integer NOT NULL,
  "title" text,
  "comment" text NOT NULL,
  "source" text DEFAULT 'manual'::text NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."custom_forms" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."form_submissions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "form_id" uuid,
  "form_slug" text NOT NULL,
  "customer_name" text,
  "customer_phone" text,
  "customer_email" text,
  "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "source" text DEFAULT 'website'::text NOT NULL,
  "page_url" text,
  "referrer" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."website_pages" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "meta_title" text,
  "meta_description" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."website_content_blocks" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "page_id" uuid,
  "block_key" text NOT NULL,
  "block_type" text DEFAULT 'text'::text NOT NULL,
  "title" text,
  "subtitle" text,
  "body" text,
  "image_url" text,
  "cta_label" text,
  "cta_url" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."seo_settings" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "default_meta_title" text,
  "default_meta_description" text,
  "default_keywords" text,
  "og_image_url" text,
  "enable_local_business_schema" boolean DEFAULT true NOT NULL,
  "enable_faq_schema" boolean DEFAULT true NOT NULL,
  "enable_review_schema" boolean DEFAULT true NOT NULL,
  "google_analytics_id" text,
  "google_search_console_verification" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."business_settings" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "business_name" text,
  "short_name" text,
  "logo_url" text,
  "favicon_url" text,
  "theme_color" text DEFAULT '#2563eb'::text NOT NULL,
  "contact_email" text,
  "contact_phone" text,
  "address" text,
  "social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "timezone" text DEFAULT 'Asia/Karachi'::text NOT NULL
);

CREATE TABLE "public"."website_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "event_type" text NOT NULL,
  "path" text NOT NULL,
  "label" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "visitor_id" text,
  "session_id" text,
  "referrer_domain" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "business_id" uuid,
  "page_title" text,
  "hostname" text,
  "referrer_url" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "utm_term" text,
  "utm_content" text,
  "device_type" text,
  "browser" text,
  "os" text,
  "screen_width" integer,
  "screen_height" integer,
  "viewport_width" integer,
  "viewport_height" integer,
  "language" text,
  "timezone" text,
  "engagement_ms" integer,
  "service_id" uuid,
  "service_name" text,
  "offer_id" uuid,
  "offer_title" text,
  "form_id" uuid,
  "form_name" text,
  "coupon_code" text,
  "consent_status" text DEFAULT 'unknown'::text NOT NULL
);

CREATE TABLE "public"."customers" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "phone" text,
  "email" text,
  "address" text,
  "notes" text,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "last_seen_at" timestamp with time zone,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "contact_identity_kind" text DEFAULT 'phone'::text NOT NULL,
  "contact_identity_key" text GENERATED ALWAYS AS (
CASE
    WHEN (contact_identity_kind = 'email'::text) THEN lower(NULLIF(btrim(email), ''::text))
    ELSE NULLIF(regexp_replace(phone, '[^0-9+]'::text, ''::text, 'g'::text), ''::text)
END) STORED
);

CREATE TABLE "public"."lead_status_history" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "old_status" text,
  "new_status" text NOT NULL,
  "changed_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "note" text
);

CREATE TABLE "public"."notifications" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "message" text,
  "type" text DEFAULT 'info'::text NOT NULL,
  "target_url" text,
  "recipient_id" uuid,
  "actor_id" uuid,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."communication_settings" (
  "id" boolean DEFAULT true NOT NULL,
  "contact_mode" text DEFAULT 'phone'::text NOT NULL,
  "emails_enabled" boolean DEFAULT false NOT NULL,
  "recipient_email" text,
  "lead_created" boolean DEFAULT true NOT NULL,
  "appointment_created" boolean DEFAULT true NOT NULL,
  "appointment_status_changed" boolean DEFAULT false NOT NULL,
  "review_created" boolean DEFAULT false NOT NULL,
  "form_submitted" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."submission_rate_limits" (
  "key_hash" text NOT NULL,
  "window_start" timestamp with time zone NOT NULL,
  "attempts" integer DEFAULT 1 NOT NULL
);

CREATE OR REPLACE FUNCTION public.finish_admin_email(p_id uuid, p_token uuid, p_provider_id text, p_error text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE changed integer;
BEGIN
 UPDATE public.email_outbox SET
 status=CASE WHEN p_provider_id IS NOT NULL THEN 'accepted' WHEN attempts>=5 THEN 'failed' ELSE 'retry' END,
 provider_id=p_provider_id,accepted_at=CASE WHEN p_provider_id IS NOT NULL THEN now() ELSE NULL END,
 last_error=left(p_error,300),available_at=now()+interval '5 minutes',lease_until=NULL,lease_token=NULL
 WHERE id=p_id AND lease_token=p_token AND status='processing';
 GET DIAGNOSTICS changed=ROW_COUNT;
 RETURN changed=1;
END;$function$;

CREATE OR REPLACE FUNCTION public.consume_submission_quota(p_key text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE used integer;
BEGIN
 IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid quota key'; END IF;
 DELETE FROM public.submission_rate_limits WHERE window_start<date_trunc('hour',now())-interval '2 days';
 INSERT INTO public.submission_rate_limits(key_hash,window_start)
 VALUES(p_key,date_trunc('hour',now()))
 ON CONFLICT(key_hash,window_start) DO UPDATE SET attempts=public.submission_rate_limits.attempts+1
 RETURNING attempts INTO used;
 RETURN used<=10;
END $function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select role
  from public.profiles
  where id = auth.uid() and is_active = true;
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(requested_permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_my_permissions()
 RETURNS TABLE(permission_key text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select p.permission_key
  from public.permissions p
  where public.has_permission(p.permission_key)
  order by p.permission_key;
$function$;

CREATE OR REPLACE FUNCTION public.set_renewal_code(new_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'superadmin'::public.app_role THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  IF new_code IS NULL OR length(btrim(new_code)) < 8 OR octet_length(btrim(new_code)) > 72 THEN
    RAISE EXCEPTION 'Renewal code must be at least 8 characters and at most 72 bytes' USING ERRCODE='22023';
  END IF;
  IF (SELECT count(*) FROM public.subscriptions) <> 1 THEN
    RAISE EXCEPTION 'Expected one subscription for this business' USING ERRCODE='22023';
  END IF;
  UPDATE public.subscriptions
  SET renewal_code_hash = extensions.crypt(btrim(new_code), extensions.gen_salt('bf', 10));
END;
$function$;

CREATE OR REPLACE FUNCTION public.renew_subscription(code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  s public.subscriptions%rowtype;
  next_end_date date;
  base_date date;
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS NULL THEN RETURN false; END IF;
  IF code IS NULL OR length(btrim(code)) < 8 OR octet_length(btrim(code)) > 72 THEN RETURN false; END IF;
  IF (SELECT count(*) FROM public.subscriptions) <> 1 THEN RETURN false; END IF;
  SELECT * INTO s FROM public.subscriptions LIMIT 1 FOR UPDATE;
  IF s.id IS NULL OR s.renewal_code_hash IS NULL THEN RETURN false; END IF;
  IF extensions.crypt(btrim(code), s.renewal_code_hash) IS DISTINCT FROM s.renewal_code_hash THEN RETURN false; END IF;
  base_date := greatest(current_date, coalesce(s.end_date, current_date));
  CASE s.plan
    WHEN 'monthly' THEN next_end_date := (base_date + interval '1 month')::date;
    WHEN 'half-yearly' THEN next_end_date := (base_date + interval '6 months')::date;
    WHEN 'yearly' THEN next_end_date := (base_date + interval '1 year')::date;
    WHEN 'one-time' THEN next_end_date := (base_date + interval '1 year')::date;
    WHEN 'lifetime' THEN next_end_date := date '2099-12-31';
    ELSE RETURN false;
  END CASE;
  UPDATE public.subscriptions SET start_date=current_date,end_date=next_end_date,
    is_active=true,renewal_code_hash=NULL WHERE id=s.id;
  INSERT INTO public.audit_logs(actor_id,event_type,target_type,target_id)
    VALUES(auth.uid(),'subscription.renewed','subscription',s.id::text);
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION app_private.queue_admin_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE cfg public.communication_settings%rowtype; event text; title text; path text;
BEGIN
 SELECT * INTO cfg FROM public.communication_settings WHERE id=true;
 IF NOT coalesce(cfg.emails_enabled,false) OR cfg.recipient_email IS NULL THEN RETURN NEW; END IF;
 CASE TG_TABLE_NAME
 WHEN 'leads' THEN event:='lead_created';title:='New lead received';path:='/crm/leads/'||NEW.id;
 WHEN 'appointments' THEN
   IF TG_OP='UPDATE' THEN
     IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
     event:='appointment_status_changed';title:='Appointment status changed';
   ELSE event:='appointment_created';title:='New appointment request';END IF;
   path:='/appointments/'||NEW.id;
 WHEN 'reviews' THEN event:='review_created';title:='New review received';path:='/dashboard';
 WHEN 'form_submissions' THEN event:='form_submitted';title:='New form submission';path:='/dashboard';
 ELSE RETURN NEW;
 END CASE;
 IF coalesce((to_jsonb(cfg)->>event)::boolean,false) THEN
 INSERT INTO public.email_outbox(event_type,entity_id,recipient_email,subject,admin_path)
 VALUES(event,NEW.id,cfg.recipient_email,title,path) ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION app_private.validate_customer_identity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE mode text; key text;
BEGIN
 IF TG_OP='UPDATE' AND NEW.phone IS NOT DISTINCT FROM OLD.phone
    AND NEW.email IS NOT DISTINCT FROM OLD.email THEN
   NEW.contact_identity_kind:=OLD.contact_identity_kind; RETURN NEW;
 END IF;
 SELECT contact_mode INTO STRICT mode FROM public.communication_settings WHERE id=true;
 NEW.phone:=nullif(regexp_replace(btrim(coalesce(NEW.phone,'')),'[[:space:]().-]','','g'),'');
 NEW.email:=nullif(lower(btrim(coalesce(NEW.email,''))),'');
 IF NEW.phone IS NOT NULL AND NEW.phone !~ '^\+?[0-9]{7,15}$' THEN
   RAISE EXCEPTION 'Enter a valid phone number' USING ERRCODE='22023';
 END IF;
 IF NEW.email IS NOT NULL AND (length(NEW.email)>254 OR NEW.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') THEN
   RAISE EXCEPTION 'Enter a valid email address' USING ERRCODE='22023';
 END IF;
 key:=CASE mode WHEN 'phone' THEN NEW.phone ELSE NEW.email END;
 IF key IS NULL THEN RAISE EXCEPTION '% is required for this business',mode USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('customer:'||mode||':'||key,0));
 IF EXISTS(SELECT 1 FROM public.customers c WHERE c.id<>NEW.id AND
   CASE mode WHEN 'phone' THEN regexp_replace(c.phone,'[^0-9+]','','g')=key
   ELSE lower(btrim(c.email))=key END) THEN
   RAISE EXCEPTION 'A customer already uses this primary contact; review existing records' USING ERRCODE='23505';
 END IF;
 NEW.contact_identity_kind:=mode;
 RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.resolve_business_customer(p_name text, p_phone text, p_email text, p_actor uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE mode text; key text; matches uuid[]; result uuid;
 phone_value text:=nullif(regexp_replace(btrim(coalesce(p_phone,'')),'[[:space:]().-]','','g'),'');
 email_value text:=nullif(lower(btrim(coalesce(p_email,''))),'');
BEGIN
 SELECT contact_mode INTO STRICT mode FROM public.communication_settings WHERE id=true;
 IF length(btrim(coalesce(p_name,'')))<2 OR length(p_name)>100 THEN RAISE EXCEPTION 'Enter a valid name' USING ERRCODE='22023'; END IF;
 IF phone_value IS NOT NULL AND phone_value !~ '^\+?[0-9]{7,15}$' THEN RAISE EXCEPTION 'Invalid phone' USING ERRCODE='22023'; END IF;
 IF email_value IS NOT NULL AND (length(email_value)>254 OR email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') THEN RAISE EXCEPTION 'Invalid email' USING ERRCODE='22023'; END IF;
 key:=CASE mode WHEN 'phone' THEN phone_value ELSE email_value END;
 IF key IS NULL THEN RAISE EXCEPTION '% is required for this business',mode USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('customer:'||mode||':'||key,0));
 SELECT array_agg(id) INTO matches FROM public.customers c WHERE
 CASE mode WHEN 'phone' THEN regexp_replace(c.phone,'[^0-9+]','','g')=key ELSE lower(btrim(c.email))=key END;
 IF coalesce(cardinality(matches),0)>1 THEN RAISE EXCEPTION 'Multiple existing customers share this contact; an administrator must resolve them' USING ERRCODE='22023'; END IF;
 IF cardinality(matches)=1 THEN RETURN matches[1]; END IF;
 INSERT INTO public.customers(name,phone,email,created_by,last_seen_at)
 VALUES(btrim(p_name),phone_value,email_value,p_actor,now()) RETURNING id INTO result;
 RETURN result;
END;$function$;

CREATE OR REPLACE FUNCTION public.claim_admin_emails(p_from text, p_admin_origin text)
 RETURNS SETOF email_outbox
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE cfg public.communication_settings%rowtype;
BEGIN
 SELECT * INTO STRICT cfg FROM public.communication_settings WHERE id=true;
 UPDATE public.email_outbox e SET status='cancelled',lease_token=NULL,lease_until=NULL
 WHERE e.status IN ('pending','retry') AND
 (NOT cfg.emails_enabled OR e.recipient_email IS DISTINCT FROM cfg.recipient_email OR
 NOT coalesce((to_jsonb(cfg)->>e.event_type)::boolean,false));
 UPDATE public.email_outbox SET status='failed',last_error='Retry window expired; reconcile in Resend before retrying'
 WHERE status IN ('retry','processing') AND first_attempt_at<now()-interval '20 hours';
 IF NOT cfg.emails_enabled THEN RETURN; END IF;
 RETURN QUERY WITH picked AS (
 SELECT e.id FROM public.email_outbox e
 WHERE ((e.status IN ('pending','retry') AND e.available_at<=now()) OR
 (e.status='processing' AND e.lease_until<now()))
 AND e.attempts<5 AND (e.first_attempt_at IS NULL OR e.first_attempt_at>now()-interval '20 hours')
 AND e.recipient_email=cfg.recipient_email AND coalesce((to_jsonb(cfg)->>e.event_type)::boolean,false)
 ORDER BY e.created_at LIMIT 1 FOR UPDATE SKIP LOCKED
 )
 UPDATE public.email_outbox e SET status='processing',attempts=e.attempts+1,
 first_attempt_at=coalesce(e.first_attempt_at,now()),lease_until=now()+interval '2 minutes',
 lease_token=gen_random_uuid(),
 request_body=coalesce(e.request_body,jsonb_build_object(
 'from',p_from,'to',jsonb_build_array(e.recipient_email),'subject',e.subject,
 'text',e.subject||E'\n\nOpen your admin panel: '||p_admin_origin||e.admin_path||
 E'\n\nSign in to view details.'))
 FROM picked WHERE e.id=picked.id RETURNING e.*;
END;$function$;

CREATE OR REPLACE FUNCTION app_private.snapshot_appointment_duration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
 IF TG_OP='INSERT' OR NEW.service_id IS DISTINCT FROM OLD.service_id THEN
  IF NEW.service_id IS NULL THEN NEW.duration_minutes:=30;
  ELSE
   SELECT coalesce(s.duration_minutes,30) INTO NEW.duration_minutes FROM public.services s WHERE s.id=NEW.service_id AND s.is_active;
   IF NOT FOUND THEN RAISE EXCEPTION 'Service is unavailable' USING ERRCODE='22023'; END IF;
  END IF;
 ELSIF NEW.duration_minutes IS DISTINCT FROM OLD.duration_minutes THEN
  NEW.duration_minutes:=OLD.duration_minutes;
 END IF;
 RETURN NEW;
END $function$;

ALTER TABLE "public"."email_outbox" ADD CONSTRAINT "email_outbox_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."email_outbox" ADD CONSTRAINT "email_outbox_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'retry'::text, 'accepted'::text, 'cancelled'::text, 'failed'::text])));

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_email_key" UNIQUE (email);

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."permissions" ADD CONSTRAINT "permissions_feature_key_action_key" UNIQUE (feature_key, action);

ALTER TABLE "public"."permissions" ADD CONSTRAINT "permissions_pkey" PRIMARY KEY (permission_key);

ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY (role, permission_key);

ALTER TABLE "public"."user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_pkey" PRIMARY KEY (user_id, permission_key);

ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."feature_settings" ADD CONSTRAINT "feature_settings_pkey" PRIMARY KEY (feature_key);

ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_grace_period_days_check" CHECK (((grace_period_days >= 0) AND (grace_period_days <= 90)));

ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_plan_check" CHECK ((plan = ANY (ARRAY['one-time'::text, 'monthly'::text, 'half-yearly'::text, 'yearly'::text, 'lifetime'::text])));

ALTER TABLE "public"."lead_notes" ADD CONSTRAINT "lead_notes_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."faqs" ADD CONSTRAINT "faqs_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."business_hours" ADD CONSTRAINT "business_hours_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6)));

ALTER TABLE "public"."business_hours" ADD CONSTRAINT "business_hours_day_of_week_key" UNIQUE (day_of_week);

ALTER TABLE "public"."business_hours" ADD CONSTRAINT "business_hours_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."service_areas" ADD CONSTRAINT "service_areas_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."services" ADD CONSTRAINT "services_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."appointment_status_history" ADD CONSTRAINT "appointment_status_history_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."testimonials" ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."testimonials" ADD CONSTRAINT "testimonials_rating_check" CHECK (((rating >= 1) AND (rating <= 5)));

ALTER TABLE "public"."media_items" ADD CONSTRAINT "media_items_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_duration_minutes_check" CHECK (((duration_minutes >= 1) AND (duration_minutes <= 1440)));

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_no_active_overlap" EXCLUDE USING gist (tsrange((appointment_date + appointment_time), ((appointment_date + appointment_time) + make_interval(mins => duration_minutes)), '[)'::text) WITH &&) WHERE ((status = ANY (ARRAY['pending'::text, 'approved'::text])));

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_source_check" CHECK ((source = ANY (ARRAY['manual'::text, 'website'::text, 'phone'::text, 'whatsapp'::text])));

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text, 'no_show'::text, 'cancelled'::text])));

ALTER TABLE "public"."offers" ADD CONSTRAINT "offers_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_code_key" UNIQUE (code);

ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_discount_type_check" CHECK ((discount_type = ANY (ARRAY['percent'::text, 'fixed'::text])));

ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)));

ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_source_check" CHECK ((source = ANY (ARRAY['manual'::text, 'website'::text, 'google'::text, 'facebook'::text])));

ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));

ALTER TABLE "public"."custom_forms" ADD CONSTRAINT "custom_forms_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."custom_forms" ADD CONSTRAINT "custom_forms_slug_key" UNIQUE (slug);

ALTER TABLE "public"."form_submissions" ADD CONSTRAINT "form_submissions_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."website_pages" ADD CONSTRAINT "website_pages_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."website_pages" ADD CONSTRAINT "website_pages_slug_key" UNIQUE (slug);

ALTER TABLE "public"."website_content_blocks" ADD CONSTRAINT "website_content_blocks_block_type_check" CHECK ((block_type = ANY (ARRAY['hero'::text, 'text'::text, 'cta'::text, 'image'::text, 'rich_text'::text])));

ALTER TABLE "public"."website_content_blocks" ADD CONSTRAINT "website_content_blocks_page_id_block_key_key" UNIQUE (page_id, block_key);

ALTER TABLE "public"."website_content_blocks" ADD CONSTRAINT "website_content_blocks_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."seo_settings" ADD CONSTRAINT "seo_settings_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."business_settings" ADD CONSTRAINT "business_settings_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."website_events" ADD CONSTRAINT "website_events_event_type_check" CHECK ((event_type = ANY (ARRAY['page_view'::text, 'call_click'::text, 'whatsapp_click'::text, 'map_click'::text, 'booking_click'::text, 'lead_submit'::text, 'appointment_submit'::text, 'coupon_validate'::text, 'coupon_redeem'::text, 'review_submit'::text, 'form_submit'::text])));

ALTER TABLE "public"."website_events" ADD CONSTRAINT "website_events_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_contact_identity_kind_check" CHECK ((contact_identity_kind = ANY (ARRAY['phone'::text, 'email'::text])));

ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."lead_status_history" ADD CONSTRAINT "lead_status_history_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."communication_settings" ADD CONSTRAINT "communication_settings_check" CHECK (((NOT emails_enabled) OR (recipient_email IS NOT NULL)));

ALTER TABLE "public"."communication_settings" ADD CONSTRAINT "communication_settings_contact_mode_check" CHECK ((contact_mode = ANY (ARRAY['phone'::text, 'email'::text])));

ALTER TABLE "public"."communication_settings" ADD CONSTRAINT "communication_settings_id_check" CHECK (id);

ALTER TABLE "public"."communication_settings" ADD CONSTRAINT "communication_settings_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."communication_settings" ADD CONSTRAINT "communication_settings_recipient_email_check" CHECK (((recipient_email IS NULL) OR ((length(recipient_email) <= 254) AND (recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'::text))));

ALTER TABLE "public"."submission_rate_limits" ADD CONSTRAINT "submission_rate_limits_pkey" PRIMARY KEY (key_hash, window_start);

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permission_key_fkey" FOREIGN KEY (permission_key) REFERENCES permissions(permission_key) ON DELETE CASCADE;

ALTER TABLE "public"."user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_permission_key_fkey" FOREIGN KEY (permission_key) REFERENCES permissions(permission_key) ON DELETE CASCADE;

ALTER TABLE "public"."user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."lead_notes" ADD CONSTRAINT "lead_notes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."lead_notes" ADD CONSTRAINT "lead_notes_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;

ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE "public"."faqs" ADD CONSTRAINT "faqs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."services" ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."appointment_status_history" ADD CONSTRAINT "appointment_status_history_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;

ALTER TABLE "public"."appointment_status_history" ADD CONSTRAINT "appointment_status_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."testimonials" ADD CONSTRAINT "testimonials_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."media_items" ADD CONSTRAINT "media_items_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

ALTER TABLE "public"."offers" ADD CONSTRAINT "offers_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE "public"."custom_forms" ADD CONSTRAINT "custom_forms_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."form_submissions" ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY (form_id) REFERENCES custom_forms(id) ON DELETE SET NULL;

ALTER TABLE "public"."website_pages" ADD CONSTRAINT "website_pages_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."website_content_blocks" ADD CONSTRAINT "website_content_blocks_page_id_fkey" FOREIGN KEY (page_id) REFERENCES website_pages(id) ON DELETE CASCADE;

ALTER TABLE "public"."website_events" ADD CONSTRAINT "website_events_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business_settings(id) ON DELETE SET NULL;

ALTER TABLE "public"."website_events" ADD CONSTRAINT "website_events_form_id_fkey" FOREIGN KEY (form_id) REFERENCES custom_forms(id) ON DELETE SET NULL;

ALTER TABLE "public"."website_events" ADD CONSTRAINT "website_events_offer_id_fkey" FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL;

ALTER TABLE "public"."website_events" ADD CONSTRAINT "website_events_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."lead_status_history" ADD CONSTRAINT "lead_status_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."lead_status_history" ADD CONSTRAINT "lead_status_history_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;

ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE;

CREATE INDEX leads_created_at_idx ON public.leads USING btree (created_at DESC);

CREATE INDEX email_outbox_entity_idx ON public.email_outbox USING btree (entity_id);

CREATE INDEX website_events_created_at_idx ON public.website_events USING btree (created_at DESC);

CREATE UNIQUE INDEX leads_submission_id_unique ON public.leads USING btree (submission_id) WHERE (submission_id IS NOT NULL);

CREATE INDEX website_events_service_idx ON public.website_events USING btree (service_id);

CREATE INDEX notifications_created_idx ON public.notifications USING btree (created_at DESC);

CREATE INDEX notifications_read_idx ON public.notifications USING btree (read_at);

CREATE INDEX website_events_path_idx ON public.website_events USING btree (path);

CREATE INDEX website_events_type_created_idx ON public.website_events USING btree (event_type, created_at DESC);

CREATE UNIQUE INDEX appointments_no_double_booking_idx ON public.appointments USING btree (appointment_date, appointment_time, service_id) WHERE (status = ANY (ARRAY['pending'::text, 'approved'::text]));

CREATE INDEX website_events_form_idx ON public.website_events USING btree (form_id);

CREATE INDEX website_events_business_created_idx ON public.website_events USING btree (business_id, created_at DESC);

CREATE INDEX website_events_visitor_idx ON public.website_events USING btree (visitor_id);

CREATE INDEX notifications_recipient_idx ON public.notifications USING btree (recipient_id);

CREATE INDEX appointment_history_appointment_idx ON public.appointment_status_history USING btree (appointment_id);

CREATE UNIQUE INDEX customers_contact_identity_unique ON public.customers USING btree (contact_identity_kind, contact_identity_key);

CREATE INDEX appointments_service_idx ON public.appointments USING btree (service_id);

CREATE INDEX website_events_path_created_at_idx ON public.website_events USING btree (path, created_at DESC);

CREATE INDEX service_areas_active_idx ON public.service_areas USING btree (is_active, sort_order);

CREATE INDEX website_events_offer_idx ON public.website_events USING btree (offer_id);

CREATE INDEX customers_email_lookup ON public.customers USING btree (lower(btrim(email)));

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);

CREATE UNIQUE INDEX profiles_one_superadmin ON public.profiles USING btree (role) WHERE (role = 'superadmin'::app_role);

CREATE INDEX lead_history_lead_idx ON public.lead_status_history USING btree (lead_id);

CREATE INDEX leads_phone_idx ON public.leads USING btree (phone);

CREATE INDEX customers_created_at_idx ON public.customers USING btree (created_at DESC);

CREATE INDEX website_events_session_idx ON public.website_events USING btree (session_id);

CREATE UNIQUE INDEX email_outbox_new_event_unique ON public.email_outbox USING btree (event_type, entity_id) WHERE (event_type <> 'appointment_status_changed'::text);

CREATE INDEX website_events_type_created_at_idx ON public.website_events USING btree (event_type, created_at DESC);

CREATE INDEX appointments_customer_idx ON public.appointments USING btree (customer_id);

CREATE INDEX leads_customer_id_idx ON public.leads USING btree (customer_id);

CREATE INDEX submission_rate_limits_expiry ON public.submission_rate_limits USING btree (window_start);

CREATE UNIQUE INDEX appointments_submission_id_unique ON public.appointments USING btree (submission_id) WHERE (submission_id IS NOT NULL);

CREATE INDEX lead_notes_lead_idx ON public.lead_notes USING btree (lead_id);

CREATE INDEX email_outbox_pending_idx ON public.email_outbox USING btree (status, available_at);

CREATE INDEX leads_status_idx ON public.leads USING btree (status);

CREATE INDEX appointments_lead_idx ON public.appointments USING btree (lead_id);

CREATE UNIQUE INDEX profiles_one_owner ON public.profiles USING btree (role) WHERE (role = 'owner'::app_role);

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER overrides_set_updated_at BEFORE UPDATE ON public.user_permission_overrides FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER business_settings_set_updated_at BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER feature_settings_set_updated_at BEFORE UPDATE ON public.feature_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER subscriptions_set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER leads_set_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER business_hours_set_updated_at BEFORE UPDATE ON public.business_hours FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER service_areas_set_updated_at BEFORE UPDATE ON public.service_areas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_media_items_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_custom_forms_updated_at BEFORE UPDATE ON public.custom_forms FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_website_pages_updated_at BEFORE UPDATE ON public.website_pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_website_content_blocks_updated_at BEFORE UPDATE ON public.website_content_blocks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_seo_settings_updated_at BEFORE UPDATE ON public.seo_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER communications_updated BEFORE UPDATE ON public.communication_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER customer_identity BEFORE INSERT OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION app_private.validate_customer_identity();

CREATE TRIGGER email_new_lead AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();

CREATE TRIGGER email_appointment AFTER INSERT OR UPDATE OF status ON public.appointments FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();

CREATE TRIGGER email_review AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();

CREATE TRIGGER email_form AFTER INSERT ON public.form_submissions FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();

CREATE TRIGGER appointment_duration_snapshot BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION app_private.snapshot_appointment_duration();

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;

ALTER TABLE "public"."email_outbox" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."email_outbox" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."profiles" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."permissions" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."role_permissions" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."user_permission_overrides" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."user_permission_overrides" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."audit_logs" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."feature_settings" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."feature_settings" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."subscriptions" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."lead_notes" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."lead_notes" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."leads" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."faqs" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."faqs" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."business_hours" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."business_hours" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."service_areas" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."service_areas" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."services" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."appointment_status_history" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."appointment_status_history" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."testimonials" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."media_items" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."media_items" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."appointments" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."offers" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."coupons" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."reviews" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."custom_forms" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."custom_forms" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."form_submissions" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."website_pages" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."website_pages" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."website_content_blocks" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."website_content_blocks" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."seo_settings" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."seo_settings" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."business_settings" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."business_settings" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."website_events" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."website_events" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."customers" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."lead_status_history" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."lead_status_history" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."notifications" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."communication_settings" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."communication_settings" FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE "public"."submission_rate_limits" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "public"."submission_rate_limits" FROM PUBLIC, anon, authenticated, service_role;

CREATE POLICY "profiles_read_self_or_team" ON "public"."profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((id = auth.uid()) OR has_permission('staff.view'::text)));

CREATE POLICY "permissions_read_authenticated" ON "public"."permissions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "role_permissions_read_authenticated" ON "public"."role_permissions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "overrides_read_self_or_manager" ON "public"."user_permission_overrides" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((user_id = auth.uid()) OR has_permission('roles.manage_overrides'::text)));

CREATE POLICY "business_settings_read_authenticated" ON "public"."business_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "business_settings_update_authorized" ON "public"."business_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (has_permission('businessProfile.update'::text)) WITH CHECK (has_permission('businessProfile.update'::text));

CREATE POLICY "features_read_authenticated" ON "public"."feature_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "features_superadmin_update" ON "public"."feature_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((current_user_role() = 'superadmin'::app_role)) WITH CHECK ((current_user_role() = 'superadmin'::app_role));

CREATE POLICY "subscriptions_read_authenticated" ON "public"."subscriptions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "subscriptions_superadmin_update" ON "public"."subscriptions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((current_user_role() = 'superadmin'::app_role)) WITH CHECK ((current_user_role() = 'superadmin'::app_role));

CREATE POLICY "audit_logs_read_authorized" ON "public"."audit_logs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('activityLogs.view'::text));

CREATE POLICY "customers_read_allowed" ON "public"."customers" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('customers.view'::text));

CREATE POLICY "customers_insert_allowed" ON "public"."customers" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_permission('customers.create'::text));

CREATE POLICY "Users can view appointment status history" ON "public"."appointment_status_history" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('appointments.view'::text));

CREATE POLICY "customers_update_allowed" ON "public"."customers" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (has_permission('customers.update'::text)) WITH CHECK (has_permission('customers.update'::text));

CREATE POLICY "customers_delete_allowed" ON "public"."customers" AS PERMISSIVE FOR DELETE TO "authenticated" USING (has_permission('customers.delete'::text));

CREATE POLICY "leads_read_allowed" ON "public"."leads" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('leads.view'::text));

CREATE POLICY "leads_insert_allowed" ON "public"."leads" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_permission('leads.create'::text));

CREATE POLICY "leads_update_allowed" ON "public"."leads" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (has_permission('leads.update'::text)) WITH CHECK (has_permission('leads.update'::text));

CREATE POLICY "leads_delete_allowed" ON "public"."leads" AS PERMISSIVE FOR DELETE TO "authenticated" USING (has_permission('leads.delete'::text));

CREATE POLICY "lead_notes_read_allowed" ON "public"."lead_notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('leads.view'::text));

CREATE POLICY "lead_notes_insert_allowed" ON "public"."lead_notes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_permission('leads.update'::text));

CREATE POLICY "lead_status_history_read_allowed" ON "public"."lead_status_history" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('leads.view'::text));

CREATE POLICY "lead_status_history_insert_allowed" ON "public"."lead_status_history" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_permission('leads.update'::text));

CREATE POLICY "Users can update appointments with permission" ON "public"."appointments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (has_permission('appointments.update'::text)) WITH CHECK (has_permission('appointments.update'::text));

CREATE POLICY "Users can delete appointments with permission" ON "public"."appointments" AS PERMISSIVE FOR DELETE TO "authenticated" USING (has_permission('appointments.delete'::text));

CREATE POLICY "business_hours_read_allowed" ON "public"."business_hours" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('businessHours.view'::text));

CREATE POLICY "business_hours_update_allowed" ON "public"."business_hours" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('businessHours.update'::text)) WITH CHECK (has_permission('businessHours.update'::text));

CREATE POLICY "service_areas_read_allowed" ON "public"."service_areas" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('serviceAreas.view'::text));

CREATE POLICY "service_areas_manage_allowed" ON "public"."service_areas" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('serviceAreas.update'::text)) WITH CHECK (has_permission('serviceAreas.update'::text));

CREATE POLICY "Users can view services with permission" ON "public"."services" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('services.view'::text));

CREATE POLICY "Users can manage services with permission" ON "public"."services" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('services.manage'::text)) WITH CHECK (has_permission('services.manage'::text));

CREATE POLICY "Users can view appointments with permission" ON "public"."appointments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('appointments.view'::text));

CREATE POLICY "Users can create appointments with permission" ON "public"."appointments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_permission('appointments.create'::text));

CREATE POLICY "Users can create appointment status history" ON "public"."appointment_status_history" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_permission('appointments.update'::text));

CREATE POLICY "Users can view faqs with permission" ON "public"."faqs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('faqs.view'::text));

CREATE POLICY "Users can manage faqs with permission" ON "public"."faqs" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('faqs.manage'::text)) WITH CHECK (has_permission('faqs.manage'::text));

CREATE POLICY "Users can view testimonials with permission" ON "public"."testimonials" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('testimonials.view'::text));

CREATE POLICY "Users can manage testimonials with permission" ON "public"."testimonials" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('testimonials.manage'::text)) WITH CHECK (has_permission('testimonials.manage'::text));

CREATE POLICY "Users can view media with permission" ON "public"."media_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((has_permission('media.view'::text) OR has_permission('gallery.view'::text)));

CREATE POLICY "Users can manage media with permission" ON "public"."media_items" AS PERMISSIVE FOR ALL TO "authenticated" USING ((has_permission('media.manage'::text) OR has_permission('gallery.manage'::text))) WITH CHECK ((has_permission('media.manage'::text) OR has_permission('gallery.manage'::text)));

CREATE POLICY "Users can view offers with permission" ON "public"."offers" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('offers.view'::text));

CREATE POLICY "Users can manage offers with permission" ON "public"."offers" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('offers.manage'::text)) WITH CHECK (has_permission('offers.manage'::text));

CREATE POLICY "Users can view coupons with permission" ON "public"."coupons" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('coupons.view'::text));

CREATE POLICY "Users can manage seo settings with permission" ON "public"."seo_settings" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('seo.manage'::text)) WITH CHECK (has_permission('seo.manage'::text));

CREATE POLICY "Users can manage coupons with permission" ON "public"."coupons" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('coupons.manage'::text)) WITH CHECK (has_permission('coupons.manage'::text));

CREATE POLICY "Users can view reviews with permission" ON "public"."reviews" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('reviews.view'::text));

CREATE POLICY "Users can manage reviews with permission" ON "public"."reviews" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('reviews.manage'::text)) WITH CHECK (has_permission('reviews.manage'::text));

CREATE POLICY "Users can view forms with permission" ON "public"."custom_forms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('forms.view'::text));

CREATE POLICY "Users can manage forms with permission" ON "public"."custom_forms" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('forms.manage'::text)) WITH CHECK (has_permission('forms.manage'::text));

CREATE POLICY "Users can view form submissions with permission" ON "public"."form_submissions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('forms.view'::text));

CREATE POLICY "Users can manage form submissions with permission" ON "public"."form_submissions" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('forms.manage'::text)) WITH CHECK (has_permission('forms.manage'::text));

CREATE POLICY "Users can view website pages with permission" ON "public"."website_pages" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('pages.view'::text));

CREATE POLICY "Users can manage website pages with permission" ON "public"."website_pages" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('pages.manage'::text)) WITH CHECK (has_permission('pages.manage'::text));

CREATE POLICY "Users can view content blocks with permission" ON "public"."website_content_blocks" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('pages.view'::text));

CREATE POLICY "Users can manage content blocks with permission" ON "public"."website_content_blocks" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_permission('pages.manage'::text)) WITH CHECK (has_permission('pages.manage'::text));

CREATE POLICY "Users can view seo settings with permission" ON "public"."seo_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('seo.view'::text));

CREATE POLICY "Users can view website analytics" ON "public"."website_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_permission('analytics.view'::text));

CREATE POLICY "notifications_read_own_or_manager" ON "public"."notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((( SELECT current_user_role() AS current_user_role) IS NOT NULL) AND ((recipient_id = ( SELECT auth.uid() AS uid)) OR ( SELECT has_permission('notifications.view'::text) AS has_permission))));

CREATE POLICY "notifications_update_own_or_manager" ON "public"."notifications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((( SELECT current_user_role() AS current_user_role) IS NOT NULL) AND ((recipient_id = ( SELECT auth.uid() AS uid)) OR ( SELECT has_permission('notifications.view'::text) AS has_permission)))) WITH CHECK (((( SELECT current_user_role() AS current_user_role) IS NOT NULL) AND ((recipient_id = ( SELECT auth.uid() AS uid)) OR ( SELECT has_permission('notifications.view'::text) AS has_permission))));

CREATE POLICY "communications_read" ON "public"."communication_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((( SELECT current_user_role() AS current_user_role) IS NOT NULL));

CREATE POLICY "communications_update" ON "public"."communication_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (( SELECT has_permission('settings.update'::text) AS has_permission)) WITH CHECK (( SELECT has_permission('settings.update'::text) AS has_permission));

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."appointment_status_history" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."appointment_status_history" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."appointment_status_history" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."appointments" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."appointments" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."appointments" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."audit_logs" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."audit_logs" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."audit_logs" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."business_hours" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."business_hours" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."business_hours" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."business_settings" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."business_settings" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."business_settings" TO "service_role";

GRANT SELECT, UPDATE ON "public"."communication_settings" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."communication_settings" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."coupons" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."coupons" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."coupons" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."custom_forms" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."custom_forms" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."custom_forms" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."customers" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."customers" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."customers" TO "service_role";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."email_outbox" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."faqs" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."faqs" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."faqs" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."feature_settings" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."feature_settings" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."feature_settings" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."form_submissions" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."form_submissions" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."form_submissions" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."lead_notes" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."lead_notes" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."lead_notes" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."lead_status_history" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."lead_status_history" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."lead_status_history" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."leads" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."leads" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."leads" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."media_items" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."media_items" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."media_items" TO "service_role";

GRANT DELETE, INSERT, SELECT ON "public"."notifications" TO "anon";

GRANT DELETE, INSERT, SELECT ON "public"."notifications" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."notifications" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."offers" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."offers" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."offers" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."permissions" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."permissions" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."permissions" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."profiles" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."profiles" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."reviews" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."reviews" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."reviews" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."role_permissions" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."role_permissions" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."role_permissions" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."seo_settings" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."seo_settings" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."seo_settings" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."service_areas" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."service_areas" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."service_areas" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."services" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."services" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."services" TO "service_role";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."submission_rate_limits" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."subscriptions" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."subscriptions" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."subscriptions" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."testimonials" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."testimonials" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."testimonials" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."user_permission_overrides" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."user_permission_overrides" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."user_permission_overrides" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."website_content_blocks" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."website_content_blocks" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."website_content_blocks" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."website_events" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."website_events" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."website_events" TO "service_role";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."website_pages" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON "public"."website_pages" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."website_pages" TO "service_role";

GRANT UPDATE ("read_at") ON "public"."notifications" TO "authenticated";

REVOKE ALL ON FUNCTION "public"."finish_admin_email"(p_id uuid, p_token uuid, p_provider_id text, p_error text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."finish_admin_email"(p_id uuid, p_token uuid, p_provider_id text, p_error text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."consume_submission_quota"(p_key text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."consume_submission_quota"(p_key text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "anon";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."handle_new_auth_user"() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."current_user_role"() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."current_user_role"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."current_user_role"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."has_permission"(requested_permission text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."has_permission"(requested_permission text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."has_permission"(requested_permission text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_my_permissions"() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."get_my_permissions"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_my_permissions"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."set_renewal_code"(new_code text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."set_renewal_code"(new_code text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."set_renewal_code"(new_code text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."renew_subscription"(code text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."renew_subscription"(code text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."renew_subscription"(code text) TO "service_role";

REVOKE ALL ON FUNCTION "app_private"."queue_admin_email"() FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION "app_private"."validate_customer_identity"() FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION "public"."resolve_business_customer"(p_name text, p_phone text, p_email text, p_actor uuid) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."resolve_business_customer"(p_name text, p_phone text, p_email text, p_actor uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."claim_admin_emails"(p_from text, p_admin_origin text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION "public"."claim_admin_emails"(p_from text, p_admin_origin text) TO "service_role";

REVOKE ALL ON FUNCTION "app_private"."snapshot_appointment_duration"() FROM PUBLIC, anon, authenticated, service_role;

GRANT USAGE, SELECT ON SEQUENCE public.audit_logs_id_seq TO service_role;

COMMIT;
