-- Applied migration: 20260925103500
-- Upgrade for the existing schema; not a blank-project installer.

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;

CREATE TABLE public.communication_settings (
 id boolean PRIMARY KEY DEFAULT true CHECK(id),
 contact_mode text NOT NULL DEFAULT 'phone' CHECK(contact_mode IN ('phone','email')),
 emails_enabled boolean NOT NULL DEFAULT false,
 recipient_email text,
 lead_created boolean NOT NULL DEFAULT true,
 appointment_created boolean NOT NULL DEFAULT true,
 appointment_status_changed boolean NOT NULL DEFAULT false,
 review_created boolean NOT NULL DEFAULT false,
 form_submitted boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(recipient_email IS NULL OR (length(recipient_email)<=254 AND recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
 CHECK(NOT emails_enabled OR recipient_email IS NOT NULL)
);
INSERT INTO public.communication_settings(id) VALUES(true);
ALTER TABLE public.communication_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.communication_settings FROM PUBLIC,anon,authenticated;
GRANT SELECT,UPDATE ON public.communication_settings TO authenticated;
GRANT ALL ON public.communication_settings TO service_role;
CREATE POLICY communications_read ON public.communication_settings FOR SELECT TO authenticated
 USING ((SELECT public.current_user_role()) IS NOT NULL);
CREATE POLICY communications_update ON public.communication_settings FOR UPDATE TO authenticated
 USING ((SELECT public.has_permission('settings.update')))
 WITH CHECK ((SELECT public.has_permission('settings.update')));
CREATE TRIGGER communications_updated BEFORE UPDATE ON public.communication_settings
 FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.customers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE public.customers ADD COLUMN contact_identity_kind text NOT NULL DEFAULT 'phone'
 CHECK(contact_identity_kind IN ('phone','email'));
ALTER TABLE public.customers ADD COLUMN contact_identity_key text GENERATED ALWAYS AS
 (CASE WHEN contact_identity_kind='email' THEN lower(nullif(btrim(email),''))
 ELSE nullif(regexp_replace(phone,'[^0-9+]','','g'),'') END) STORED;
CREATE UNIQUE INDEX customers_contact_identity_unique
 ON public.customers(contact_identity_kind,contact_identity_key);
ALTER TABLE public.customers DROP CONSTRAINT customers_phone_key;
CREATE INDEX customers_email_lookup ON public.customers(lower(btrim(email)));

CREATE FUNCTION app_private.validate_customer_identity() RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $f$
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
END;$f$;
REVOKE ALL ON FUNCTION app_private.validate_customer_identity() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER customer_identity BEFORE INSERT OR UPDATE ON public.customers
 FOR EACH ROW EXECUTE FUNCTION app_private.validate_customer_identity();

CREATE FUNCTION public.resolve_business_customer(p_name text,p_phone text,p_email text,p_actor uuid DEFAULT NULL)
 RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $f$
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
END;$f$;
REVOKE ALL ON FUNCTION public.resolve_business_customer(text,text,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_business_customer(text,text,text,uuid) TO service_role;

CREATE TABLE public.email_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 event_type text NOT NULL,
 entity_id uuid NOT NULL,
 recipient_email text NOT NULL,
 subject text NOT NULL,
 admin_path text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','retry','accepted','cancelled','failed')),
 attempts integer NOT NULL DEFAULT 0,
 available_at timestamptz NOT NULL DEFAULT now(),
 first_attempt_at timestamptz,
 lease_until timestamptz,
 lease_token uuid,
 request_body jsonb,
 provider_id text,
 last_error text,
 created_at timestamptz NOT NULL DEFAULT now(),
 accepted_at timestamptz
);
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_outbox FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.email_outbox TO service_role;
CREATE INDEX email_outbox_pending_idx ON public.email_outbox(status,available_at);
CREATE INDEX email_outbox_entity_idx ON public.email_outbox(entity_id);
CREATE UNIQUE INDEX email_outbox_new_event_unique ON public.email_outbox(event_type,entity_id)
 WHERE event_type<>'appointment_status_changed';

CREATE FUNCTION app_private.queue_admin_email() RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $f$
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
END;$f$;
REVOKE ALL ON FUNCTION app_private.queue_admin_email() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER email_new_lead AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();
CREATE TRIGGER email_appointment AFTER INSERT OR UPDATE OF status ON public.appointments FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();
CREATE TRIGGER email_review AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();
CREATE TRIGGER email_form AFTER INSERT ON public.form_submissions FOR EACH ROW EXECUTE FUNCTION app_private.queue_admin_email();

CREATE FUNCTION public.claim_admin_emails(p_from text,p_admin_origin text)
 RETURNS SETOF public.email_outbox LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $f$
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
END;$f$;
CREATE FUNCTION public.finish_admin_email(p_id uuid,p_token uuid,p_provider_id text,p_error text)
 RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $f$
DECLARE changed integer;
BEGIN
 UPDATE public.email_outbox SET
 status=CASE WHEN p_provider_id IS NOT NULL THEN 'accepted' WHEN attempts>=5 THEN 'failed' ELSE 'retry' END,
 provider_id=p_provider_id,accepted_at=CASE WHEN p_provider_id IS NOT NULL THEN now() ELSE NULL END,
 last_error=left(p_error,300),available_at=now()+interval '5 minutes',lease_until=NULL,lease_token=NULL
 WHERE id=p_id AND lease_token=p_token AND status='processing';
 GET DIAGNOSTICS changed=ROW_COUNT;
 RETURN changed=1;
END;$f$;
REVOKE ALL ON FUNCTION public.claim_admin_emails(text,text),public.finish_admin_email(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_admin_emails(text,text),public.finish_admin_email(uuid,uuid,text,text) TO service_role;


