-- Applied migration: 20260925105310
-- Upgrade for the existing schema; not a blank-project installer.

ALTER TABLE public.leads ADD COLUMN submission_id uuid, ADD COLUMN request_fingerprint text;
ALTER TABLE public.appointments ADD COLUMN submission_id uuid, ADD COLUMN request_fingerprint text;
CREATE UNIQUE INDEX leads_submission_id_unique ON public.leads(submission_id) WHERE submission_id IS NOT NULL;
CREATE UNIQUE INDEX appointments_submission_id_unique ON public.appointments(submission_id) WHERE submission_id IS NOT NULL;


