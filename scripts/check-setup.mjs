// Reads configuration locally. Never prints secrets or makes network requests.
const kind=process.argv[2];
if(!['admin','website'].includes(kind))throw new Error('Use admin or website');
const env=process.env; const errors=[]; const notes=[];
const requireValue=(key)=>{if(!env[key]?.trim()||/^(change.?me|your[_ -]|replace[_ -]|example)/i.test(env[key]))errors.push(`${key}: missing or placeholder`);};
const url=(key)=>{requireValue(key);if(!env[key])return;try{const u=new URL(env[key]);if(u.username||u.password||u.search||u.hash||u.pathname!=='/')throw 0;if(u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))throw 0;}catch{errors.push(`${key}: use an HTTPS origin, without path or credentials`);}};
const secret=(key)=>{requireValue(key);if(env[key]&&env[key].length<32)errors.push(`${key}: use at least 32 random characters`);};
if(kind==='admin'){
 url('NEXT_PUBLIC_SUPABASE_URL');requireValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');requireValue('SUPABASE_SERVICE_ROLE_KEY');url('ADMIN_SITE_URL');
 for(const k of ['WEBSITE_CONFIG_API_KEY','WEBSITE_LEAD_API_KEY','WEBSITE_APPOINTMENT_API_KEY','WEBSITE_ANALYTICS_API_KEY'])secret(k);
 if(env.SUPABASE_SERVICE_ROLE_KEY&&env.SUPABASE_SERVICE_ROLE_KEY===env.NEXT_PUBLIC_SUPABASE_ANON_KEY)errors.push('Supabase public and service keys must be different');
 const emailKeys=['RESEND_API_KEY','RESEND_FROM','CRON_SECRET'];
 if(emailKeys.some(k=>env[k])){emailKeys.forEach(requireValue);secret('CRON_SECRET');}
 else notes.push('Email delivery is not configured; keep email notifications off.');
}else{
 url('NEXT_PUBLIC_SITE_URL');url('ADMIN_API_URL');secret('WEBSITE_CONFIG_API_KEY');
 for(const [flag,key] of [['LEAD_FORM_ENABLED','WEBSITE_LEAD_API_KEY'],['APPOINTMENT_FORM_ENABLED','WEBSITE_APPOINTMENT_API_KEY']]){
  if(env[flag]==='true')secret(key);else if(env[flag]&&env[flag]!=='false')errors.push(`${flag}: use true or false`);else notes.push(`${flag}: form disabled`);
 }
 if(!env.WEBSITE_ANALYTICS_API_KEY)notes.push('Analytics forwarding key missing; tracking will not be confirmed.');
}
for(const k of Object.keys(env).filter(k=>k.startsWith('NEXT_PUBLIC_')&&/(SERVICE_ROLE|SECRET|RESEND|API_KEY)/.test(k)))errors.push(`${k}: server secret must not use NEXT_PUBLIC_`);
notes.forEach(n=>console.log('NOTE '+n));errors.forEach(e=>console.error('FAIL '+e));
console.log(errors.length?`${errors.length} configuration issue(s).`:'Configuration shape passed. Run live acceptance tests before launch.');
process.exitCode=errors.length?1:0;
