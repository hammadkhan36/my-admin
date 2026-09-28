-- Client-facing roles use RLS-controlled CRUD, never table maintenance privileges.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
