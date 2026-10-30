-- BUG-10 step 1 of 2: READ-ONLY. Changes nothing.
-- Run business_default_country_code.sql first (this file needs the column).
-- Shows customers whose phone numbers would collide once normalized to E.164,
-- and numbers that cannot be normalized at all. Review the result BEFORE running any backfill.
-- Mirrors normalize_phone() (lib/phone-utils.ts); no function is created here.

WITH cfg AS (
  SELECT regexp_replace(coalesce((SELECT default_country_code FROM public.business_settings LIMIT 1), '+92'), '[^0-9]', '', 'g') AS cc
), cleaned AS (
  SELECT c.id, c.name, c.phone, c.created_at,
         regexp_replace(btrim(c.phone), '[[:space:]().-]', '', 'g') AS s, cfg.cc
  FROM public.customers c CROSS JOIN cfg
  WHERE c.phone IS NOT NULL AND btrim(c.phone) <> ''
), digits AS (
  SELECT *, CASE
      WHEN s !~ '^\+?[0-9]+$' THEN NULL
      WHEN left(s, 1) = '+' THEN substr(s, 2)
      WHEN left(s, 2) = '00' THEN substr(s, 3)
      WHEN left(s, 1) = '0' THEN cc || substr(s, 2)
      WHEN left(s, length(cc)) = cc AND length(s) - length(cc) >= 7 THEN s
      ELSE cc || s
    END AS d
  FROM cleaned
), normalized AS (
  SELECT id, name, phone, created_at,
         CASE WHEN d ~ '^[1-9][0-9]{6,14}$' THEN '+' || d END AS e164
  FROM digits
)
-- A) Groups of customers that would become the same number (must be resolved/merged first).
SELECT 'DUPLICATE' AS issue, e164 AS normalized_phone, id, name, phone AS current_phone, created_at
FROM normalized
WHERE e164 IN (SELECT e164 FROM normalized WHERE e164 IS NOT NULL GROUP BY e164 HAVING count(*) > 1)
UNION ALL
-- B) Numbers that cannot be normalized (would be rejected on save).
SELECT 'INVALID', NULL, id, name, phone, created_at
FROM normalized
WHERE e164 IS NULL
ORDER BY issue, normalized_phone, created_at;
