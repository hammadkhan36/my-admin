-- Applied migration: 20260927220111
-- Upgrade for the existing schema; not a blank-project installer.
CREATE TABLE public.submission_rate_limits (
 key_hash text NOT NULL, window_start timestamptz NOT NULL, attempts integer NOT NULL DEFAULT 1,
 PRIMARY KEY(key_hash,window_start));
ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.submission_rate_limits FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.submission_rate_limits TO service_role;
CREATE INDEX submission_rate_limits_expiry ON public.submission_rate_limits(window_start);
CREATE FUNCTION public.consume_submission_quota(p_key text) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE used integer;
BEGIN
 IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid quota key'; END IF;
 DELETE FROM public.submission_rate_limits WHERE window_start<date_trunc('hour',now())-interval '2 days';
 INSERT INTO public.submission_rate_limits(key_hash,window_start)
 VALUES(p_key,date_trunc('hour',now()))
 ON CONFLICT(key_hash,window_start) DO UPDATE SET attempts=public.submission_rate_limits.attempts+1
 RETURNING attempts INTO used;
 RETURN used<=10;
END $$;
REVOKE ALL ON FUNCTION public.consume_submission_quota(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_submission_quota(text) TO service_role;

