-- Business hours: an open day (not closed, not 24h) must have both times and closes_at > opens_at.
-- Repeatable. NOT VALID so existing bad rows do not block the upgrade; new/changed rows are checked.
-- Review bad rows first (read-only):
--   SELECT day_name, opens_at, closes_at FROM public.business_hours
--   WHERE NOT (is_closed OR is_24h OR (opens_at IS NOT NULL AND closes_at IS NOT NULL AND closes_at > opens_at));

ALTER TABLE public.business_hours DROP CONSTRAINT IF EXISTS business_hours_open_times_check;
ALTER TABLE public.business_hours ADD CONSTRAINT business_hours_open_times_check
  CHECK (is_closed OR is_24h OR (opens_at IS NOT NULL AND closes_at IS NOT NULL AND closes_at > opens_at)) NOT VALID;
