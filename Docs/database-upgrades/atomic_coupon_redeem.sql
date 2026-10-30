-- Upgrade for the existing schema; not a blank-project installer.
-- SEC-03: redeem a coupon in ONE atomic UPDATE (no read-then-write race).
-- Safe to run more than once. Run this BEFORE deploying the matching my-admin code.
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_code text)
 RETURNS TABLE(coupon_id uuid, coupon_code text, new_used_count integer)
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 WITH today AS (
  SELECT (now() AT TIME ZONE coalesce((SELECT timezone FROM public.business_settings LIMIT 1),'UTC'))::date AS d)
 UPDATE public.coupons c SET used_count = c.used_count + 1
 FROM today
 WHERE c.code = p_code AND c.is_active
  AND (c.starts_at IS NULL OR c.starts_at <= today.d)
  AND (c.ends_at IS NULL OR c.ends_at >= today.d)
  AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)
 RETURNING c.id, c.code, c.used_count;
$function$;

REVOKE ALL ON FUNCTION public.redeem_coupon(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text) TO service_role;
