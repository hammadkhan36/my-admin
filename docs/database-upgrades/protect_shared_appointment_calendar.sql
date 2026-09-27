-- Applied migration: 20260927084106
-- Upgrade for the existing schema; not a blank-project installer.

ALTER TABLE public.appointments ADD COLUMN duration_minutes integer NOT NULL DEFAULT 30 CHECK(duration_minutes BETWEEN 1 AND 1440);
UPDATE public.appointments a SET duration_minutes=least(1440,greatest(1,coalesce(s.duration_minutes,30))) FROM public.services s WHERE s.id=a.service_id;
DO $$
DECLARE conflict_id uuid; previous_status text;
BEGIN
 LOOP
  SELECT b.id,b.status INTO conflict_id,previous_status
  FROM public.appointments a JOIN public.appointments b
  ON (a.created_at,a.id)<(b.created_at,b.id)
  AND tsrange(a.appointment_date+a.appointment_time,a.appointment_date+a.appointment_time+make_interval(mins=>a.duration_minutes),'[)')
   && tsrange(b.appointment_date+b.appointment_time,b.appointment_date+b.appointment_time+make_interval(mins=>b.duration_minutes),'[)')
  WHERE a.status IN ('pending','approved') AND b.status IN ('pending','approved')
  LIMIT 1;
  EXIT WHEN NOT FOUND;
  UPDATE public.appointments SET status='cancelled' WHERE id=conflict_id;
  INSERT INTO public.appointment_status_history(appointment_id,old_status,new_status,note)
  VALUES(conflict_id,previous_status,'cancelled','Overlapping test booking cancelled during launch setup; no record deleted.');
 END LOOP;
END $$;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_no_active_overlap EXCLUDE USING gist
(tsrange(appointment_date+appointment_time,appointment_date+appointment_time+make_interval(mins=>duration_minutes),'[)') WITH &&)
WHERE (status IN ('pending','approved'));
CREATE FUNCTION app_private.snapshot_appointment_duration() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
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
END $$;
REVOKE ALL ON FUNCTION app_private.snapshot_appointment_duration() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER appointment_duration_snapshot BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION app_private.snapshot_appointment_duration();


