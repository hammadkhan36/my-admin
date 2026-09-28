# Configuration checker

Use Node 22+ and run `npm run check:setup` from the repository root. `.env.local` is loaded if present; environment values already supplied by your shell/hosting take priority. The checker prints variable names and errors, never values, and makes no network calls.

A nonzero exit means configuration is incomplete or malformed. A successful result proves only the configuration shape, not that credentials are correct or the services are reachable. Follow `docs/LAUNCH-SETUP.md` for live acceptance checks.

Do not commit real `.env` files. `.env.example` contains placeholders only. Website/admin API key pairs must match for this business; a different business must have its own keys. Public Supabase keys may be in NEXT_PUBLIC variables; service-role, Resend and website API keys must not be.
