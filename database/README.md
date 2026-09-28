# Naye business ka database setup

Har business ka alag Supabase project aur alag admin/website deployment banayein. Clinic ka existing project reuse na karein.

## Files ka order

1. Naye, empty Supabase project mein **SQL Editor** kholein.
2. `fresh-install.sql` ka complete code run karein. Is mein 33 app tables, security policies, functions, indexes aur triggers hain. Auth system Supabase khud provide karta hai.
3. `defaults.sql` run karein. Roles/permissions, contact settings, subscription aur 7 closed days create honge. Hours ko admin mein business ke mutabiq set karein. Default timezone UTC hai, emails off hain, koi service/customer create nahi hota.
4. Supabase **Authentication → Users** se apna first user create karein. Password khud securely set karein; SQL mein password na dalein.
5. `bootstrap-admin.sql` mein `CHANGE_ME@example.com` ko us user ke email se replace karke run karein. Yeh pehla superadmin banata hai. Dobara chalane par existing superadmin ko replace nahi karega.
6. Admin `.env.example` aur website `.env.example` ki values apne hosting environment mein set karein. Dono apps is business ke same project/backend se connect hon, kisi aur business se nahi.
7. Admin login karke business identity, timezone, hours, services, permissions aur contact mode set karein. `defaults.sql` ek 30-day initial subscription banata hai; launch ke liye intended subscription dates set karein.
8. Live forms enable karne se pehle `npm run check:setup` aur launch checklist follow karein.

## Existing clinic ke liye

**Fresh installer existing clinic par mat chalayein.** Woh existing profiles table milne par stop karta hai; baqi conflicting objects par transaction rollback hota hai. Existing project updates `docs/database-upgrades` mein hain. Installer ko successful setup ke baad repeat nahi karna; defaults ko repeat karna safe hai aur business values overwrite nahi hotin.

`Docs/Sqlcodes` purane reference snippets hain; unhein is installer ke saath mix na karein. CLI migration history aur SQL Editor installation alag workflows hain. Yeh files SQL Editor ke liye hain, generated CLI migration files nahi.

## Kya copy nahi hota

Passwords, Auth users, API keys, clinic data, customer details, appointments, emails, uploaded files, DNS, hosting settings ya Resend account copy nahi hote. Current app schema mein koi Storage bucket configured nahi; media entries URL references hain. Supabase Auth site URL/redirect URLs aur signup policy apne deployment ke liye configure karein.

## Tests

Node 22+ mein `npm ci`, phir `npm run test:database` aur `npm run test:core` chalayein. Database test PGlite (Postgres WASM) mein fresh schema banata hai. Supabase Auth ka SQL interface fixture hai; real Auth service, SMTP, REST API aur hosting is test ka hissa nahi. Local database test live login/email delivery ka substitute nahi.

Baseline source: existing application schema, 28 September 2026. Row-level permissions preserve kiye gaye; client roles ko TRUNCATE/TRIGGER/REFERENCES grants nahi diye gaye. Server-only email/quotas ki tables client roles se blocked hain.

## Current release scope
Campaigns, referrals, product catalogue and scheduled follow-ups are unfinished and hidden from client navigation/settings. Their old demo pages return 404. Do not advertise them as working features. Calendar now shows actual appointments for a selected business date; availability uses the real business-hours editor.
