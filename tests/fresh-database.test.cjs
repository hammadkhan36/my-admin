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
