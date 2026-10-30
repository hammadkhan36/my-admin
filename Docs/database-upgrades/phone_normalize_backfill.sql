-- BUG-10 step 2 of 2: rewrites stored phone numbers to E.164 (+<digits>).
-- Run order: business_default_country_code.sql -> phone_duplicates_check.sql (must return NO rows) -> this file.
--
-- What it does (one transaction, all-or-nothing):
--   1. Creates/replaces public.normalize_phone() (same body as database/fresh-install.sql).
--   2. Stops (rolls everything back) if any customer phone is invalid or two customers would
--      become the same number. Nothing is changed in that case; the error lists the rows.
--   3. Normalizes customers.phone.
--   4. Normalizes leads.phone and appointments.customer_phone. These are history, so they never
--      abort the run: values that cannot be normalized are left as they are (a NOTICE shows the count).
-- Repeatable: rows that are already E.164 are skipped, so a second run changes nothing.
-- Side effect: updated_at moves forward on every row that is changed (existing updated_at triggers).
--
-- WARNING (real client): this takes SHARE ROW EXCLUSIVE locks on customers, leads and appointments.
-- New bookings and enquiries wait (or time out) until COMMIT. Run it on a client's live database only
-- when no booking or enquiry is in progress, e.g. outside opening hours. Fine on a dev database.
-- Needs business_settings.default_country_code (business_default_country_code.sql).

BEGIN;

CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone text, p_country_code text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
DECLARE s text; cc text; digits text;
BEGIN
 s:=regexp_replace(btrim(coalesce(p_phone,'')),'[[:space:]().-]','','g');
 IF s='' THEN RETURN NULL; END IF;
 IF s !~ '^\+?[0-9]+$' THEN RAISE EXCEPTION 'Enter a valid phone number' USING ERRCODE='22023'; END IF;
 cc:=regexp_replace(coalesce(p_country_code,'+92'),'[^0-9]','','g');
 IF left(s,1)='+' THEN digits:=substr(s,2);
 ELSIF left(s,2)='00' THEN digits:=substr(s,3);
 ELSIF left(s,1)='0' THEN digits:=cc||substr(s,2);
 ELSIF left(s,length(cc))=cc AND length(s)-length(cc)>=7 THEN digits:=s;
 ELSE digits:=cc||s;
 END IF;
 IF digits !~ '^[1-9][0-9]{6,14}$' THEN RAISE EXCEPTION 'Enter a valid phone number' USING ERRCODE='22023'; END IF;
 RETURN '+'||digits;
END;$function$;

REVOKE ALL ON FUNCTION public.normalize_phone(p_phone text, p_country_code text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.normalize_phone(p_phone text, p_country_code text) TO service_role;

LOCK TABLE public.customers, public.leads, public.appointments IN SHARE ROW EXCLUSIVE MODE;

DO $backfill$
DECLARE
  cc text;
  r record;
  v_e164 text;
  problems text := '';
  problem_count int := 0;
  changed int;
  skipped int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='business_settings' AND column_name='default_country_code') THEN
    RAISE EXCEPTION 'Run business_default_country_code.sql first (business_settings.default_country_code is missing).';
  END IF;
  SELECT default_country_code INTO cc FROM public.business_settings LIMIT 1;
  cc := coalesce(cc, '+92');

  -- Preflight: customers must be valid and unique after normalizing. Any problem aborts the whole run.
  CREATE TEMP TABLE _phone_norm(id uuid, name text, phone text, e164 text) ON COMMIT DROP;
  FOR r IN SELECT c.id, c.name, c.phone FROM public.customers c WHERE c.phone IS NOT NULL AND btrim(c.phone) <> '' LOOP
    BEGIN
      v_e164 := public.normalize_phone(r.phone, cc);
    EXCEPTION WHEN SQLSTATE '22023' THEN
      v_e164 := NULL;
    END;
    INSERT INTO _phone_norm VALUES (r.id, r.name, r.phone, v_e164);
  END LOOP;

  FOR r IN
    SELECT 'INVALID' AS issue, id, name, phone, e164 FROM _phone_norm WHERE e164 IS NULL
    UNION ALL
    SELECT 'DUPLICATE', id, name, phone, e164 FROM _phone_norm
    WHERE e164 IN (SELECT n.e164 FROM _phone_norm n WHERE n.e164 IS NOT NULL GROUP BY n.e164 HAVING count(*) > 1)
    ORDER BY 1, 5, 2
  LOOP
    problem_count := problem_count + 1;
    IF problem_count <= 10 THEN
      problems := problems || format(E'\n  %s: %s (%s) phone=%s -> %s', r.issue, r.id, r.name, r.phone, coalesce(r.e164, '?'));
    END IF;
  END LOOP;
  IF problem_count > 0 THEN
    RAISE EXCEPTION 'Phone backfill stopped, nothing was changed. % customer row(s) invalid or duplicate (first 10):%
Resolve them (see phone_duplicates_check.sql) and run again.', problem_count, problems;
  END IF;

  UPDATE public.customers c SET phone = n.e164
  FROM _phone_norm n WHERE n.id = c.id AND c.phone IS DISTINCT FROM n.e164;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RAISE NOTICE 'customers.phone normalized: % row(s)', changed;

  -- History tables: normalize what can be normalized, leave the rest alone.
  CREATE TEMP TABLE _hist_norm(tbl text, id uuid, e164 text) ON COMMIT DROP;
  FOR r IN SELECT 'leads' AS tbl, l.id, l.phone FROM public.leads l WHERE l.phone IS NOT NULL AND btrim(l.phone) <> ''
           UNION ALL
           SELECT 'appointments', a.id, a.customer_phone FROM public.appointments a
           WHERE a.customer_phone IS NOT NULL AND btrim(a.customer_phone) <> '' LOOP
    BEGIN
      v_e164 := public.normalize_phone(r.phone, cc);
    EXCEPTION WHEN SQLSTATE '22023' THEN
      v_e164 := NULL;
    END;
    INSERT INTO _hist_norm VALUES (r.tbl, r.id, v_e164);
  END LOOP;

  UPDATE public.leads l SET phone = h.e164
  FROM _hist_norm h WHERE h.tbl = 'leads' AND h.id = l.id AND h.e164 IS NOT NULL AND l.phone IS DISTINCT FROM h.e164;
  GET DIAGNOSTICS changed = ROW_COUNT;
  SELECT count(*) INTO skipped FROM _hist_norm WHERE tbl = 'leads' AND e164 IS NULL;
  RAISE NOTICE 'leads.phone normalized: % row(s), left unchanged (not a valid number): %', changed, skipped;

  UPDATE public.appointments a SET customer_phone = h.e164
  FROM _hist_norm h WHERE h.tbl = 'appointments' AND h.id = a.id AND h.e164 IS NOT NULL AND a.customer_phone IS DISTINCT FROM h.e164;
  GET DIAGNOSTICS changed = ROW_COUNT;
  SELECT count(*) INTO skipped FROM _hist_norm WHERE tbl = 'appointments' AND e164 IS NULL;
  RAISE NOTICE 'appointments.customer_phone normalized: % row(s), left unchanged (not a valid number): %', changed, skipped;
END
$backfill$;

COMMIT;
