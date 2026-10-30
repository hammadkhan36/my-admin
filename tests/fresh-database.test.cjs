const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const {pgcrypto}=require('@electric-sql/pglite/contrib/pgcrypto');
const schema=fs.readFileSync('database/fresh-install.sql','utf8');
const defaults=fs.readFileSync('database/defaults.sql','utf8');
// Auth fixture models the SQL interface only, not Supabase GoTrue or JWT validation.
const authFixture=`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}');
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
GRANT USAGE ON SCHEMA auth TO authenticated,anon,service_role;`;
const owner='11111111-1111-4111-8111-111111111111';
async function scalar(db,sql){return Object.values((await db.query(sql)).rows[0])[0];}
test('fresh schema, repeatable defaults, RLS, booking conflicts and notification queue',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);await db.exec(defaults);
 assert.equal(await scalar(db,"SELECT count(*)::int FROM pg_tables WHERE schemaname='public'"),33);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.business_settings'),1);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.subscriptions'),1);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.business_hours'),7);
 await assert.rejects(db.exec("UPDATE public.business_hours SET is_closed=false,opens_at='18:00',closes_at='02:00' WHERE day_of_week=1"),/business_hours_open_times_check/);
 await assert.rejects(db.exec("UPDATE public.business_hours SET is_closed=false,opens_at=NULL,closes_at=NULL WHERE day_of_week=1"),/business_hours_open_times_check/);
 await db.exec("UPDATE public.business_hours SET is_closed=false,opens_at='09:00',closes_at='17:00' WHERE day_of_week=1; UPDATE public.business_hours SET is_closed=true,opens_at=NULL,closes_at=NULL WHERE day_of_week=1");
 assert.equal(await scalar(db,"SELECT count(*)::int FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r' AND NOT relrowsecurity"),0);
 await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${owner}','owner@example.test'); UPDATE public.profiles SET role='owner',is_active=true WHERE id='${owner}'; SET request.jwt.claim.sub='${owner}'; SET ROLE authenticated;`);
 assert.equal(await scalar(db,"SELECT public.has_permission('customers.create')"),true);
 await assert.rejects(db.exec('TRUNCATE public.customers'),/permission denied/);
 await assert.rejects(db.exec('SELECT * FROM public.email_outbox'),/permission denied/);
 await assert.rejects(db.exec("SELECT public.consume_submission_quota(repeat('a',64))"),/permission denied/);
 await db.exec('RESET ROLE;');
 await db.exec("UPDATE public.communication_settings SET contact_mode='email',emails_enabled=true,recipient_email='owner@example.test';");
 const id=await scalar(db,"SELECT public.resolve_business_customer('Example Customer',null,'CUSTOMER@example.test',null)");
 assert.equal(await scalar(db,"SELECT public.resolve_business_customer('Different name',null,'customer@example.test',null)"),id);
 await db.exec(`INSERT INTO public.leads(name,email,customer_id) VALUES ('Example Customer','customer@example.test','${id}');`);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.email_outbox'),1);
 const job=(await db.query("SELECT * FROM public.claim_admin_emails('Alerts <alerts@example.test>','https://admin.example.test')")).rows[0];
 assert.equal(job.status,'processing');
 assert.equal((await db.query("SELECT * FROM public.claim_admin_emails('Alerts <alerts@example.test>','https://admin.example.test')")).rows.length,0);
 assert.equal((await db.query('SELECT public.finish_admin_email($1,$2,$3,$4) AS done',[job.id,owner,'fake-provider-id',null])).rows[0].done,false);
 assert.equal((await db.query('SELECT public.finish_admin_email($1,$2,$3,$4) AS done',[job.id,job.lease_token,'fake-provider-id',null])).rows[0].done,true);
 assert.equal(await scalar(db,'SELECT status FROM public.email_outbox LIMIT 1'),'accepted');
 await db.exec("UPDATE public.communication_settings SET emails_enabled=false; INSERT INTO public.leads(name,email) VALUES ('No Email','second@example.test');");
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.email_outbox'),1);

 await db.exec("INSERT INTO public.appointments(customer_name,customer_email,appointment_date,appointment_time) VALUES ('Example','customer@example.test','2098-01-01','10:00');");
 await assert.rejects(db.exec("INSERT INTO public.appointments(customer_name,customer_email,appointment_date,appointment_time) VALUES ('Example','customer@example.test','2098-01-01','10:15');"),/appointments_no_active_overlap/);
 await db.exec("INSERT INTO public.appointments(customer_name,customer_email,appointment_date,appointment_time) VALUES ('Example','customer@example.test','2098-01-01','10:30');");
 for(let i=0;i<11;i++)assert.equal(await scalar(db,"SELECT public.consume_submission_quota(repeat('a',64))"),i<10);
 await db.exec(`UPDATE public.profiles SET is_active=false WHERE id='${owner}'; SET ROLE authenticated;`);
 assert.equal(await scalar(db,"SELECT public.has_permission('customers.view')"),false);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.customers'),0);
 await db.exec('RESET ROLE;');
 await assert.rejects(db.exec(schema),/Existing application found/);await db.exec('ROLLBACK;');
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.customers'),1);
 }finally{await db.close();}
});
test('second business starts empty and first-admin bootstrap cannot overwrite an existing admin',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.customers'),0);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM public.email_outbox'),0);
 const bootstrap=fs.readFileSync('database/bootstrap-admin.sql','utf8');
 await assert.rejects(db.exec(bootstrap),/Replace target_email/);
 await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${owner}','owner@example.test');`);
 assert.equal(await scalar(db,`SELECT role FROM public.profiles WHERE id='${owner}'`),'staff');
 assert.equal(await scalar(db,`SELECT is_active FROM public.profiles WHERE id='${owner}'`),false);
 const configured=bootstrap.replace("target_email text := 'CHANGE_ME@example.com'","target_email text := 'owner@example.test'");
 await db.exec(configured);
 assert.equal(await scalar(db,`SELECT role FROM public.profiles WHERE id='${owner}'`),'superadmin');
 assert.equal(await scalar(db,`SELECT is_active FROM public.profiles WHERE id='${owner}'`),true);
 await assert.rejects(db.exec(configured),/superadmin already exists/);
 await db.exec(`SET request.jwt.claim.sub='${owner}'; SET ROLE authenticated; SELECT public.set_renewal_code('test-renewal-code');`);
 const subCols=(await db.query('SELECT * FROM public.subscriptions')).rows[0];
 assert.ok(!('renewal_code_hash' in subCols));
 await assert.rejects(db.exec('SELECT * FROM app_private.subscription_secrets'),/permission denied/);
 assert.equal(await scalar(db,"SELECT public.renew_subscription('wrong-renewal-code')"),false);
 assert.equal(await scalar(db,"SELECT public.renew_subscription('test-renewal-code')"),true);
 assert.equal(await scalar(db,"SELECT public.renew_subscription('test-renewal-code')"),false);
 // Lockout: 5 wrong attempts lock renewal, even the right code is then refused until a new code is set.
 await db.exec("SELECT public.set_renewal_code('test-renewal-code');");
 for(let i=0;i<5;i++)assert.equal(await scalar(db,"SELECT public.renew_subscription('wrong-renewal-code')"),false);
 await assert.rejects(db.exec("SELECT public.renew_subscription('test-renewal-code')"),/renewal_locked/);
 const status=(await db.query('SELECT * FROM public.get_renewal_code_status()')).rows[0];
 assert.equal(status.has_code,true);assert.ok(status.locked_until);
 await db.exec("SELECT public.set_renewal_code('test-renewal-code');");
 assert.equal((await db.query('SELECT * FROM public.get_renewal_code_status()')).rows[0].locked_until,null);
 assert.equal(await scalar(db,"SELECT public.renew_subscription('test-renewal-code')"),true);
 await db.exec(`RESET ROLE; INSERT INTO auth.users(id,email) VALUES ('22222222-2222-4222-8222-222222222222','staff@example.test'); SET request.jwt.claim.sub='22222222-2222-4222-8222-222222222222'; SET ROLE authenticated;`);
 await assert.rejects(db.exec('SELECT * FROM public.get_renewal_code_status()'),/Forbidden/);
 await db.exec('RESET ROLE;');
 }finally{await db.close();}
});
test('upgrade SQL moves the renewal hash, is repeatable and keeps the old code working',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 const upgrade=fs.readFileSync('Docs/database-upgrades/protect_signup_and_renewal_code.sql','utf8');
 // Recreate the pre-upgrade shape: hash stored on the public table.
 await db.exec("DROP TABLE app_private.subscription_secrets; ALTER TABLE public.subscriptions ADD COLUMN renewal_code_hash text; UPDATE public.subscriptions SET renewal_code_hash=extensions.crypt('old-renewal-code',extensions.gen_salt('bf',4));");
 await db.exec(upgrade);await db.exec(upgrade);
 assert.equal(await scalar(db,"SELECT count(*)::int FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='renewal_code_hash'"),0);
 assert.equal(await scalar(db,'SELECT count(*)::int FROM app_private.subscription_secrets WHERE renewal_code_hash IS NOT NULL'),1);
 await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${owner}','owner@example.test'); UPDATE public.profiles SET role='superadmin',is_active=true WHERE id='${owner}'; SET request.jwt.claim.sub='${owner}'; SET ROLE authenticated;`);
 assert.equal(await scalar(db,"SELECT public.renew_subscription('old-renewal-code')"),true);
 }finally{await db.close();}
});

async function can(db,user,key){
 await db.exec(`SET request.jwt.claim.sub='${user}'; SET ROLE authenticated;`);
 try{return await scalar(db,`SELECT public.has_permission('${key}')`);}finally{await db.exec('RESET ROLE;');}
}
async function withRoles(db){
 const ids={};
 for(const [i,role] of ['admin','manager','supervisor','staff'].entries()){
  const id=`2222222${i}-2222-4222-8222-222222222222`;
  await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${id}','${role}@example.test'); UPDATE public.profiles SET role='${role}',is_active=true WHERE id='${id}';`);
  ids[role]=id;
 }
 return ids;
}
test('manager and supervisor can open Offers and Coupons; only manager can manage; campaigns stay admin-only',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 const u=await withRoles(db);
 for(const key of ['offers.view','coupons.view']){
  assert.equal(await can(db,u.manager,key),true);
  assert.equal(await can(db,u.supervisor,key),true);
  assert.equal(await can(db,u.staff,key),false);
 }
 for(const key of ['offers.manage','coupons.manage']){
  assert.equal(await can(db,u.manager,key),true);
  assert.equal(await can(db,u.supervisor,key),false);
 }
 assert.equal(await can(db,u.manager,'campaigns.view'),false);
 }finally{await db.close();}
});
test('staff.delete exists but no role has it; admin can reset passwords; a delete override no longer breaks the FK',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 const u=await withRoles(db);
 assert.equal(await scalar(db,"SELECT count(*)::int FROM public.permissions WHERE permission_key='staff.delete'"),1);
 assert.equal(await scalar(db,"SELECT count(*)::int FROM public.role_permissions WHERE permission_key='staff.delete'"),0);
 assert.equal(await can(db,u.admin,'staff.delete'),false);
 assert.equal(await can(db,u.admin,'staff.reset_password'),true);
 assert.equal(await can(db,u.manager,'staff.reset_password'),false);
 await db.exec(`INSERT INTO public.user_permission_overrides(user_id,permission_key,allowed) VALUES ('${u.admin}','staff.delete',true);`);
 assert.equal(await can(db,u.admin,'staff.delete'),true);
 }finally{await db.close();}
});
test('marketing and staff permission upgrade SQL fixes an old database and is repeatable',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 const u=await withRoles(db);
 await db.exec("DELETE FROM public.role_permissions WHERE permission_key IN ('offers.view','coupons.view') AND role IN ('manager','supervisor'); DELETE FROM public.role_permissions WHERE permission_key='staff.reset_password'; DELETE FROM public.permissions WHERE permission_key IN ('staff.delete','staff.reset_password');");
 assert.equal(await can(db,u.manager,'offers.view'),false);
 const upgrade=fs.readFileSync('Docs/database-upgrades/fix_marketing_and_staff_permissions.sql','utf8');
 await db.exec(upgrade);await db.exec(upgrade);
 assert.equal(await can(db,u.manager,'coupons.view'),true);
 assert.equal(await can(db,u.supervisor,'offers.view'),true);
 assert.equal(await can(db,u.supervisor,'offers.manage'),false);
 assert.equal(await can(db,u.admin,'staff.reset_password'),true);
 assert.equal(await scalar(db,"SELECT count(*)::int FROM public.permissions WHERE permission_key='staff.delete'"),1);
 assert.equal(await scalar(db,"SELECT count(*)::int FROM public.role_permissions WHERE permission_key='staff.delete'"),0);
 }finally{await db.close();}
});
test('redeem_coupon is atomic, honours limit/dates/active, is service-only and its upgrade SQL is repeatable',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 await db.exec(`INSERT INTO public.coupons(code,title,usage_limit) VALUES ('ONCE','Once',1);
  INSERT INTO public.coupons(code,title) VALUES ('OPEN','Open');
  INSERT INTO public.coupons(code,title,is_active) VALUES ('OFF','Off',false);
  INSERT INTO public.coupons(code,title,ends_at) VALUES ('OLD','Old','2000-01-01');
  INSERT INTO public.coupons(code,title,starts_at) VALUES ('SOON','Soon','2098-01-01');`);
 const redeem=async code=>(await db.query('SELECT * FROM public.redeem_coupon($1)',[code])).rows;
 const first=await redeem('ONCE');
 assert.equal(first.length,1);assert.equal(first[0].new_used_count,1);
 assert.equal((await redeem('ONCE')).length,0);
 assert.equal(await scalar(db,"SELECT used_count FROM public.coupons WHERE code='ONCE'"),1);
 assert.equal((await redeem('OPEN'))[0].new_used_count,1);
 assert.equal((await redeem('OPEN'))[0].new_used_count,2);
 for(const code of ['OFF','OLD','SOON','MISSING'])assert.equal((await redeem(code)).length,0);
 await db.exec(`SET request.jwt.claim.sub='${owner}'; SET ROLE authenticated;`);
 await assert.rejects(db.exec("SELECT * FROM public.redeem_coupon('OPEN')"),/permission denied/);
 await db.exec('RESET ROLE;');
 const upgrade=fs.readFileSync('Docs/database-upgrades/atomic_coupon_redeem.sql','utf8');
 await db.exec('DROP FUNCTION public.redeem_coupon(text);');
 await db.exec(upgrade);await db.exec(upgrade);
 assert.equal((await redeem('OPEN'))[0].new_used_count,3);
 }finally{await db.close();}
});

test('subscription_status: DB date, grace boundaries, business timezone, suspend and lifetime',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 const st=async(at)=>scalar(db,`SELECT state FROM public.subscription_status('${at}'::timestamptz)`);
 await db.exec("UPDATE public.subscriptions SET plan='monthly',start_date='2026-01-01',end_date='2026-01-10',grace_period_days=7,is_active=true");
 await db.exec("UPDATE public.business_settings SET timezone='UTC'");
 assert.equal(await st('2026-01-10T23:59:00Z'),'active');
 assert.equal(await st('2026-01-11T00:00:00Z'),'grace');
 assert.equal(await st('2026-01-17T23:59:00Z'),'grace');
 assert.equal(await st('2026-01-18T00:00:00Z'),'expired');
 // Same instant, different business day: 19:30Z is already 00:30 on the 18th in Karachi (UTC+5).
 await db.exec("UPDATE public.business_settings SET timezone='Asia/Karachi'");
 assert.equal(await st('2026-01-17T19:30:00Z'),'expired');
 assert.equal(await st('2026-01-17T18:30:00Z'),'grace');
 await db.exec("UPDATE public.business_settings SET timezone='UTC'");
 const row=(await db.query("SELECT * FROM public.subscription_status('2026-01-12T00:00:00Z')")).rows[0];
 assert.equal(String(row.end_date.toISOString?row.end_date.toISOString().slice(0,10):row.end_date).slice(0,10),'2026-01-10');
 await db.exec("UPDATE public.subscriptions SET is_active=false");
 assert.equal(await st('2026-01-05T00:00:00Z'),'expired');
 await db.exec("UPDATE public.subscriptions SET is_active=true,plan='lifetime'");
 assert.equal(await st('2040-01-01T00:00:00Z'),'active');
 await db.exec("DELETE FROM public.subscriptions");
 assert.equal(await st('2026-01-05T00:00:00Z'),'expired');
 }finally{await db.close();}
});

test('renew_subscription is owner/superadmin only and the SEC-02 upgrade SQL is repeatable',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 const upgrade=fs.readFileSync('Docs/database-upgrades/server_subscription_check.sql','utf8');
 await db.exec(upgrade);await db.exec(upgrade);
 const staff='22222222-2222-4222-8222-222222222222',boss='33333333-3333-4333-8333-333333333333';
 await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${owner}','sa@example.test'),('${staff}','staff@example.test'),('${boss}','boss@example.test');
  UPDATE public.profiles SET role='superadmin',is_active=true WHERE id='${owner}';
  UPDATE public.profiles SET role='admin',is_active=true WHERE id='${staff}';
  UPDATE public.profiles SET role='owner',is_active=true WHERE id='${boss}';
  UPDATE public.subscriptions SET end_date='2020-01-01';`);
 const as=async(user,sql)=>{await db.exec(`SET request.jwt.claim.sub='${user}'; SET ROLE authenticated;`);try{return await scalar(db,sql);}finally{await db.exec('RESET ROLE;');}};
 await as(owner,"SELECT public.set_renewal_code('test-renewal-code')");
 assert.equal(await as(staff,"SELECT public.renew_subscription('test-renewal-code')"),false);
 assert.equal(await scalar(db,"SELECT state FROM public.subscription_status()"),'expired');
 assert.equal(await as(boss,"SELECT public.renew_subscription('test-renewal-code')"),true);
 assert.equal(await scalar(db,"SELECT state FROM public.subscription_status()"),'active');
 }finally{await db.close();}
});

test('phone numbers normalize to E.164 in SQL like lib/phone-utils.ts',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 assert.equal(await scalar(db,'SELECT default_country_code FROM public.business_settings'),'+92');
 await assert.rejects(db.exec("UPDATE public.business_settings SET default_country_code='92'"),/default_country_code_check/);
 for(const raw of ['03001234567','+923001234567','0092 300 123-4567','(0300) 1234567','923001234567','3001234567'])
  assert.equal(await scalar(db,`SELECT public.normalize_phone('${raw}','+92')`),'+923001234567',raw);
 assert.equal(await scalar(db,"SELECT public.normalize_phone('07911 123456','+44')"),'+447911123456');
 assert.equal(await scalar(db,"SELECT public.normalize_phone('+14155550123','+92')"),'+14155550123');
 assert.equal(await scalar(db,"SELECT public.normalize_phone('  ','+92') IS NULL"),true);
 for(const raw of ['abc','123','+0300123456','03001234567890123'])
  await assert.rejects(db.query('SELECT public.normalize_phone($1,$2)',[raw,'+92']),/valid phone/,raw);
 const id=await scalar(db,"SELECT public.resolve_business_customer('Local Person','03001234567',null,null)");
 assert.equal(await scalar(db,"SELECT public.resolve_business_customer('Other Name','+92 300 1234567',null,null)"),id);
 assert.equal(await scalar(db,`SELECT phone FROM public.customers WHERE id='${id}'`),'+923001234567');
 for(let run=0;run<2;run++)await db.exec(fs.readFileSync('Docs/database-upgrades/business_default_country_code.sql','utf8'));
 assert.equal(await scalar(db,'SELECT default_country_code FROM public.business_settings'),'+92');
 // Pre-fix rows (stored un-normalized) are what the read-only duplicates check must flag.
 await db.exec("ALTER TABLE public.customers DISABLE TRIGGER USER; INSERT INTO public.customers(name,phone) VALUES ('Old A','03009990000'),('Old B','+923009990000'),('Old C','not-a-phone'); ALTER TABLE public.customers ENABLE TRIGGER USER;");
 const dup=(await db.query(fs.readFileSync('Docs/database-upgrades/phone_duplicates_check.sql','utf8'))).rows;
 assert.deepEqual(dup.map(r=>r.issue+':'+r.current_phone).sort(),['DUPLICATE:+923009990000','DUPLICATE:03009990000','INVALID:not-a-phone']);
 assert.equal(await scalar(db,"SELECT count(*)::int FROM public.customers WHERE phone IN ('03009990000','+923009990000','not-a-phone')"),3);
 await db.exec("DELETE FROM public.customers WHERE name LIKE 'Old %'");
 await db.exec("UPDATE public.business_settings SET default_country_code='+44'");
 const uk=await scalar(db,"SELECT public.resolve_business_customer('UK Person','07911123456',null,null)");
 assert.equal(await scalar(db,`SELECT phone FROM public.customers WHERE id='${uk}'`),'+447911123456');
 }finally{await db.close();}
});

test('phone_normalize_backfill.sql normalizes customers/leads/appointments, stops on conflict and is repeatable',async()=>{
 const db=new PGlite({extensions:{pgcrypto}});
 const backfill=fs.readFileSync('Docs/database-upgrades/phone_normalize_backfill.sql','utf8');
 const phones=async t=>(await db.query(`SELECT ${t==='customers'?'phone':t==='leads'?'phone':'customer_phone'} AS p FROM public.${t} ORDER BY created_at,id`)).rows.map(r=>r.p);
 try{
 await db.exec(authFixture);await db.exec(schema);await db.exec(defaults);
 // Phone-mode business with rows stored before normalization existed.
 await db.exec("UPDATE public.communication_settings SET contact_mode='phone'");
 await db.exec("ALTER TABLE public.customers DISABLE TRIGGER USER; INSERT INTO public.customers(name,phone) VALUES ('Old A','03001234567'),('Old B','(0301) 2345678'),('Already','+923021111111'); ALTER TABLE public.customers ENABLE TRIGGER USER;");
 await db.exec("INSERT INTO public.leads(name,phone) VALUES ('Lead ok','0333 1112222'),('Lead bad','call me');");
 await db.exec("INSERT INTO public.appointments(customer_name,customer_phone,appointment_date,appointment_time) VALUES ('Appt','03441112222','2098-01-01','10:00');");
 // Function missing in an older upgrade path: the file must create it.
 await db.exec('DROP FUNCTION public.normalize_phone(text,text)');
 await db.exec(backfill);
 assert.deepEqual((await db.query('SELECT phone FROM public.customers ORDER BY name')).rows.map(r=>r.phone),['+923021111111','+923001234567','+923012345678']);
 assert.deepEqual(await phones('leads'),['+923331112222','call me']);
 assert.deepEqual(await phones('appointments'),['+923441112222']);
 const stamp=await scalar(db,'SELECT max(updated_at)::text FROM public.customers');
 await db.exec(backfill);
 assert.equal(await scalar(db,'SELECT max(updated_at)::text FROM public.customers'),stamp);
 assert.deepEqual(await phones('leads'),['+923331112222','call me']);
 // Conflict: two customers become the same number -> abort, nothing changes.
 await db.exec("ALTER TABLE public.customers DISABLE TRIGGER USER; INSERT INTO public.customers(name,phone) VALUES ('Dup A','03009990000'),('Dup B','+92 300 9990000'),('Fresh','03451230000'); ALTER TABLE public.customers ENABLE TRIGGER USER;");
 await assert.rejects(db.exec(backfill),/stopped, nothing was changed.*DUPLICATE/s);
 await db.exec('ROLLBACK;');
 assert.equal(await scalar(db,"SELECT phone FROM public.customers WHERE name='Fresh'"),'03451230000');
 // Invalid customer phone also stops the run.
 await db.exec("DELETE FROM public.customers WHERE name LIKE 'Dup %'; ALTER TABLE public.customers DISABLE TRIGGER USER; INSERT INTO public.customers(name,phone) VALUES ('Bad','not-a-phone'); ALTER TABLE public.customers ENABLE TRIGGER USER;");
 await assert.rejects(db.exec(backfill),/INVALID/);
 await db.exec('ROLLBACK;');
 assert.equal(await scalar(db,"SELECT phone FROM public.customers WHERE name='Fresh'"),'03451230000');
 await db.exec("DELETE FROM public.customers WHERE name='Bad'");
 await db.exec(backfill);
 assert.equal(await scalar(db,"SELECT phone FROM public.customers WHERE name='Fresh'"),'+923451230000');
 }finally{await db.close();}
});
