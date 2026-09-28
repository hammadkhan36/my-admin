-- Run once as project owner after creating the user in Supabase Authentication.
-- Replace the email below. This does not create an account or set a password.
DO $$
DECLARE target_email text := 'CHANGE_ME@example.com'; target_id uuid;
BEGIN
  IF target_email='CHANGE_ME@example.com' THEN RAISE EXCEPTION 'Replace target_email with your existing Auth user email'; END IF;
  IF EXISTS(SELECT 1 FROM public.profiles WHERE role='superadmin') THEN RAISE EXCEPTION 'A superadmin already exists; use the admin staff screen'; END IF;
  SELECT id INTO STRICT target_id FROM public.profiles WHERE lower(email)=lower(target_email);
  UPDATE public.profiles SET role='superadmin',is_active=true WHERE id=target_id;
  INSERT INTO public.audit_logs(actor_id,event_type,target_type,target_id,details)
  VALUES(target_id,'setup.first_superadmin','profile',target_id,'{"source":"bootstrap-admin.sql"}'::jsonb);
END $$;
