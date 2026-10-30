-- Server-side subscription check (SEC-02).
-- Safe to run more than once. Run AFTER protect_signup_and_renewal_code.sql.
--
-- BEFORE running: check subscriptions.end_date in Supabase and set a renewal code
-- from the super-admin dashboard, otherwise staff can be locked out right away.

CREATE OR REPLACE FUNCTION public.subscription_status(at timestamptz DEFAULT now())
 RETURNS TABLE(state text, plan text, end_date date, grace_end_date date)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
DECLARE
  s public.subscriptions%rowtype;
  today date;
  grace_end date;
BEGIN
  SELECT * INTO s FROM public.subscriptions ORDER BY created_at LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'expired'::text, NULL::text, NULL::date, NULL::date;
    RETURN;
  END IF;
  IF NOT s.is_active THEN
    RETURN QUERY SELECT 'expired'::text, s.plan, s.end_date, NULL::date;
    RETURN;
  END IF;
  IF s.plan = 'lifetime' OR s.end_date IS NULL THEN
    RETURN QUERY SELECT 'active'::text, s.plan, s.end_date, NULL::date;
    RETURN;
  END IF;
  today := (at AT TIME ZONE coalesce((SELECT timezone FROM public.business_settings LIMIT 1),'UTC'))::date;
  grace_end := s.end_date + s.grace_period_days;
  RETURN QUERY SELECT
    CASE WHEN today <= s.end_date THEN 'active' WHEN today <= grace_end THEN 'grace' ELSE 'expired' END,
    s.plan, s.end_date, grace_end;
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
  today date;
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS NULL OR public.current_user_role() NOT IN ('superadmin'::public.app_role,'owner'::public.app_role) THEN RETURN false; END IF;
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
  today := (now() AT TIME ZONE coalesce((SELECT timezone FROM public.business_settings LIMIT 1),'UTC'))::date;
  base_date := greatest(today, coalesce(s.end_date, today));
  CASE s.plan
    WHEN 'monthly' THEN next_end_date := (base_date + interval '1 month')::date;
    WHEN 'half-yearly' THEN next_end_date := (base_date + interval '6 months')::date;
    WHEN 'yearly' THEN next_end_date := (base_date + interval '1 year')::date;
    WHEN 'one-time' THEN next_end_date := (base_date + interval '1 year')::date;
    WHEN 'lifetime' THEN next_end_date := date '2099-12-31';
    ELSE RETURN false;
  END CASE;
  UPDATE public.subscriptions SET start_date=today,end_date=next_end_date,
    is_active=true WHERE id=s.id;
  UPDATE app_private.subscription_secrets
    SET renewal_code_hash=NULL, failed_attempts=0, locked_until=NULL, updated_at=now()
    WHERE subscription_id=s.id;
  INSERT INTO public.audit_logs(actor_id,event_type,target_type,target_id)
    VALUES(auth.uid(),'subscription.renewed','subscription',s.id::text);
  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.subscription_status(timestamptz) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.subscription_status(timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.subscription_status(timestamptz) TO service_role;

REVOKE ALL ON FUNCTION public.renew_subscription(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.renew_subscription(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.renew_subscription(text) TO service_role;
