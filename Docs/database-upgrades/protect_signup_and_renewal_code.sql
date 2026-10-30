-- Upgrade for an EXISTING database: SEC-05 (new signups inactive) + SEC-07 (renewal code hash private, attempt limit).
-- Safe to run more than once. Run in the Supabase SQL Editor. Do NOT run fresh-install.sql on an existing project.
BEGIN;

CREATE TABLE IF NOT EXISTS app_private.subscription_secrets (
  subscription_id uuid PRIMARY KEY REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  renewal_code_hash text,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE app_private.subscription_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON app_private.subscription_secrets FROM PUBLIC, anon, authenticated, service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='renewal_code_hash') THEN
    INSERT INTO app_private.subscription_secrets(subscription_id, renewal_code_hash)
    SELECT id, renewal_code_hash FROM public.subscriptions WHERE renewal_code_hash IS NOT NULL
    ON CONFLICT (subscription_id) DO NOTHING;
    ALTER TABLE public.subscriptions DROP COLUMN renewal_code_hash;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  -- New Auth signups stay inactive until an admin activates them (createTeamMember / bootstrap-admin.sql do this).
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'staff',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
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
  INSERT INTO app_private.subscription_secrets(subscription_id, renewal_code_hash, failed_attempts, locked_until, updated_at)
  SELECT id, extensions.crypt(btrim(new_code), extensions.gen_salt('bf', 10)), 0, NULL, now()
  FROM public.subscriptions
  ON CONFLICT (subscription_id) DO UPDATE
  SET renewal_code_hash = EXCLUDED.renewal_code_hash, failed_attempts = 0, locked_until = NULL, updated_at = now();
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
  sec app_private.subscription_secrets%rowtype;
  next_end_date date;
  base_date date;
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS NULL THEN RETURN false; END IF;
  IF code IS NULL OR length(btrim(code)) < 8 OR octet_length(btrim(code)) > 72 THEN RETURN false; END IF;
  IF (SELECT count(*) FROM public.subscriptions) <> 1 THEN RETURN false; END IF;
  SELECT * INTO s FROM public.subscriptions LIMIT 1 FOR UPDATE;
  IF s.id IS NULL THEN RETURN false; END IF;
  SELECT * INTO sec FROM app_private.subscription_secrets WHERE subscription_id = s.id FOR UPDATE;
  IF NOT FOUND OR sec.renewal_code_hash IS NULL THEN RETURN false; END IF;
  -- Locked: raise without touching counters so nothing needs to be committed.
  IF sec.locked_until IS NOT NULL AND sec.locked_until > now() THEN
    RAISE EXCEPTION 'renewal_locked' USING ERRCODE='P0001';
  END IF;
  IF extensions.crypt(btrim(code), sec.renewal_code_hash) IS DISTINCT FROM sec.renewal_code_hash THEN
    IF sec.failed_attempts + 1 >= 5 THEN
      UPDATE app_private.subscription_secrets
      SET failed_attempts = 0, locked_until = now() + interval '15 minutes', updated_at = now()
      WHERE subscription_id = s.id;
    ELSE
      UPDATE app_private.subscription_secrets
      SET failed_attempts = failed_attempts + 1, locked_until = NULL, updated_at = now()
      WHERE subscription_id = s.id;
    END IF;
    INSERT INTO public.audit_logs(actor_id,event_type,target_type,target_id)
      VALUES(auth.uid(),'subscription.renew_failed','subscription',s.id::text);
    RETURN false;
  END IF;
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
    is_active=true WHERE id=s.id;
  UPDATE app_private.subscription_secrets
    SET renewal_code_hash=NULL, failed_attempts=0, locked_until=NULL, updated_at=now()
    WHERE subscription_id=s.id;
  INSERT INTO public.audit_logs(actor_id,event_type,target_type,target_id)
    VALUES(auth.uid(),'subscription.renewed','subscription',s.id::text);
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_renewal_code_status()
 RETURNS TABLE(has_code boolean, failed_attempts integer, locked_until timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'superadmin'::public.app_role THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  RETURN QUERY
  SELECT coalesce(sec.renewal_code_hash IS NOT NULL, false), coalesce(sec.failed_attempts, 0), sec.locked_until
  FROM public.subscriptions s
  LEFT JOIN app_private.subscription_secrets sec ON sec.subscription_id = s.id
  LIMIT 1;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_renewal_code(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_renewal_code(text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.renew_subscription(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.renew_subscription(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_renewal_code_status() FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_renewal_code_status() TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_renewal_code_status() TO service_role;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- READ-ONLY review (changes nothing): active staff profiles not created from the dashboard.
-- They may have come from public signup. Review them in Team -> Staff and deactivate any you do not recognise.
SELECT id, email, full_name, created_at
FROM public.profiles
WHERE role = 'staff' AND is_active = true AND created_by IS NULL
ORDER BY created_at DESC;
