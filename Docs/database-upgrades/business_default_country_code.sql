-- Adds business_settings.default_country_code (E.164 prefix used to normalize local phone numbers).
-- Repeatable: safe to run more than once. Changes no existing rows other than adding the default '+92'.
-- Change the value later from Business -> Profile.

ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS default_country_code text NOT NULL DEFAULT '+92';

ALTER TABLE public.business_settings
  DROP CONSTRAINT IF EXISTS business_settings_default_country_code_check;

ALTER TABLE public.business_settings
  ADD CONSTRAINT business_settings_default_country_code_check
  CHECK (default_country_code ~ '^\+[1-9][0-9]{0,3}$');
