# Website Leads API

## Endpoint

POST /api/public/leads

Website server request ke x-api-key header mein
WEBSITE_LEAD_API_KEY send karta hai.

Har business ki key unique honi chahiye.
Us business ke website aur admin mein same key hoti hai.

## Required fields

- name: 2–100 characters
- phone: formatting remove hone ke baad 7–15 digits
- Phone ke start par optional + allowed hai

## Optional fields

- email
- service
- message
- page_url
- referrer
- utm_source
- utm_medium
- utm_campaign

API source ko website aur initial status ko new rakhti hai.
Visitor source, status ya customer_id choose nahi kar sakta.

## Customer matching

Customer exact cleaned phone number se match hota hai.

Existing customer mile:
- Uska name/email replace nahi hota.
- New enquiry lead mein submitted name/email save hota hai.
- Lead existing customer se link hoti hai.

Customer na mile:
- New customer create hota hai.
- Lead us customer se link hoti hai.

Phone match identity verification nahi hai.
Customer ki private information visitor ko return mat karo.

## Phone formats

Spaces, brackets, dots aur dashes remove hote hain.

Local aur international formats abhi equivalent nahi:
03001234567 aur +923001234567 different values hain.

Country-aware phone normalization separate pending task hai.
Existing records ko plan ke baghair rewrite mat karo.

## Successful submission

Success tab return hoti hai jab lead insert confirm ho.

Uske baad background follow-ups:
- Customer last_seen_at
- Initial lead status history
- Activity log
- Dashboard notification

Follow-up fail ho to saved lead successful hi rahegi.
Failure server logs mein record hota hai.
Automatic retry queue abhi implemented nahi.

## Separate business setup

Admin apne environment ke Supabase project ko use karta hai.

Har business ke liye:
- Separate Supabase account/project
- Separate admin deployment
- Separate website deployment
- Unique WEBSITE_LEAD_API_KEY

Content files change karne se database connection change nahi hota.

SUPABASE_SERVICE_ROLE_KEY sirf admin server environment mein rakho.
Is key ko NEXT_PUBLIC_ variable mat banao.

## Current limitations

1. Customer creation aur lead creation single transaction nahi.
   Lead insert fail ho to created customer reh sakta hai.

2. Retried submissions abhi duplicate leads bana sakti hain.
   Database-backed idempotency pending hai.

3. Concurrent customer insert recovery ke liye customers.phone
   par unique constraint zaroori hai. Schema verify karna pending hai.

4. Rate limiting aur stronger bot protection pending hai.

5. Background follow-ups guaranteed delivery queue nahi hain.

6. Contact permission separately database mein store nahi hoti.

7. Phone formats ki country-aware normalization pending hai.

## Test checklist

Sirf intended test database par test karo.

- Valid enquiry: lead aur linked customer save hon.
- Same phone, changed name/email:
  existing customer details unchanged rahen;
  new lead mein submitted details hon.
- Invalid phone/email: request reject ho.
- Wrong API key: 401 ho.
- Malformed JSON: 400 ho.
- Notification failure:
  saved lead ka response successful rahe.
- Logs mein enquiry text ya secret keys na hon.

## Production status

Ye change complete launch approval nahi hai.

Website ka LEAD_FORM_ENABLED=false rakho jab tak:
- Correct database connection verify na ho.
- Build aur integration tests pass na hon.
- Database constraints, retry handling aur abuse protection
  complete na hon.
