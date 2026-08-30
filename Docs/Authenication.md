


Tumhara actual business model

Hum ek martaba complete reusable codebase banayenge:

Business Website Template
        +
Admin Dashboard Template
        +
Supabase Database Schema

Phir har naye client ke liye separate setup hoga:

Client A
├── Client A website
├── Client A admin dashboard/domain
├── Client A ka separate Supabase project
├── Client A ka Owner
└── Hamara Super Admin

Client B
├── Client B website
├── Client B admin dashboard/domain
├── Client B ka separate Supabase project
├── Client B ka Owner
└── Hamara Super Admin

Client A ka data, users, settings ya features Client B ke project mein bilkul nahi aayenge.

Iska matlab:

Har deployment sirf ek business ka hoga.
Har business ka separate Supabase project hoga.
Har business ki website aur dashboard usi Supabase se connected honge.
Hamara Super Admin har client ke database mein manually create hoga.
Owner bhi initially manually create hoga.
Dashboard ke through baqi team members create honge.
Super Admin live dashboard se subscription, features aur business configuration set karega.

Ab isi architecture ko final samjhenge.

Simplified database architecture

Ab humein ye complexity nahi chahiye:

business_members
active_business
business switching
tenant selection
business_id on every table
multi-business memberships

Kyunke ek Supabase project mein sirf ek business hoga.

Required tables

Authentication aur permissions ke liye:

profiles
role_permissions
user_permission_overrides
business_settings
feature_settings
subscription
activity_logs

Supabase Auth users ka login handle karega.

1. Profiles table

Ab role directly profiles mein store karna bilkul theek hai:

profiles
- id
- email
- full_name
- role
- is_active
- created_by
- created_at
- updated_at

Available roles:

superadmin
owner
admin
manager
supervisor
staff

Isliye tumhara current code:

.select("role")

theek direction mein hai. Sirf roles aur security rules properly add karne hain.

2. Roles ka hierarchy
Super Admin
   ↓
Owner
   ↓
Admin
   ↓
Manager
   ↓
Supervisor
   ↓
Staff
Super Admin

Super Admin hamari SaaS/service company ka account hoga.

Super Admin:

Supabase se manually create hoga
Dashboard se create nahi ho sakega
Subscription manage karega
Feature modules enable/disable/lock karega
Business branding aur initial configuration karega
Owner aur tamam doosre roles ke kaam kar sakega
Super Admin dashboard access karega
Normal business dashboard bhi access kar sakega
Users activate/deactivate kar sakega
Password reset kar sakega
Permissions manage kar sakega
Complete activity logs dekh sakega

Super Admin ke liye permission tables check karna necessary nahi ہوگا:

if (role === "superadmin") {
  return true;
}
Owner

Owner business ka actual malik hoga.

Owner:

Initially manually Supabase/server setup se create hoga
Admin, Manager, Supervisor aur Staff create kar sakega
Members remove/deactivate kar sakega
Members ke permissions customize kar sakega
Business ke enabled modules par complete control rakhega
Business settings manage karega
Team passwords reset kar sakega
Subscription dates change nahi karega
Locked features unlock nahi karega
Super Admin create/remove nahi karega
Doosra Owner create nahi karega
Admin

Admin:

Manager, Supervisor aur Staff add kar sakega
Operational features manage karega
Members ki limited permissions set kar sakega
Owner aur Super Admin manage nahi karega
Subscription aur feature locks change nahi karega
Admin create karne ki permission default mein nahi hogi

Owner kisi particular Admin ko users.create_admin permission separately de sakta hai.

Manager

Manager:

Leads, customers, appointments aur follow-ups manage karega
Supervisor aur Staff ka work manage karega
Users create/remove nahi karega
Roles aur permissions change nahi karega
Sensitive business settings access nahi karega
Supervisor

Supervisor:

Staff activities supervise karega
Leads, appointments ya customers par limited actions karega
Reports dekh sakega
Users aur permissions manage nahi karega
Staff

Staff:

Sirf assigned operational features use karega
Leads/customers/appointments par allowed actions karega
Users, roles, subscription aur settings access nahi karega
3. Hybrid permissions system

Har role ki predefined permissions hongi.

Example:

Admin:
customers.view = true
customers.create = true
customers.update = true
customers.delete = true

Manager:
customers.view = true
customers.create = true
customers.update = true
customers.delete = false

Lekin particular user ke liye permission override ki ja sakegi.

Example:

User: Ali
Role: Manager

Role default:
customers.delete = false

User override:
customers.delete = true
role_permissions
role
permission_key
allowed

Example:

admin | leads.view          | true
admin | leads.delete        | true
manager | leads.view        | true
manager | leads.delete      | false
staff | leads.view          | true
staff | leads.delete        | false
user_permission_overrides
user_id
permission_key
allowed
created_by

Example:

Ali | leads.delete | true
Final permission calculation
1. User authenticated hai?
2. Profile active hai?
3. Super Admin hai? → full permission
4. Feature business ke liye enabled hai?
5. User-specific override available hai?
6. Override nahi hai to role permission use karo

Pseudo code:

function canAccess(user, permission) {
  if (!user.is_active) return false;

  if (user.role === "superadmin") {
    return true;
  }

  if (!isFeatureEnabled(permission)) {
    return false;
  }

  const override = getUserOverride(user.id, permission);

  if (override !== null) {
    return override;
  }

  return getRolePermission(user.role, permission);
}
4. Feature management ka actual model

Kyunke ek deployment mein ek business hai, feature_settings table bhi simple hogi:

feature_key
enabled
locked
unlock_code
updated_by
updated_at

Example:

leads          | true  | false
customers      | true  | false
appointments   | false | true
reviews        | true  | false
campaigns      | false | true
seo            | true  | false

Super Admin client ki requirement ke mutabiq dashboard mein login karke modules configure karega.

Example bakery:

Leads = enabled
Customers = enabled
Appointments = disabled
Products = enabled
Offers = enabled
Service Areas = disabled

Example salon:

Leads = enabled
Customers = enabled
Appointments = enabled
Services = enabled
Calendar = enabled
Products = disabled

Tumhara existing FeaturesProvider aur sidebar filtering isi model ke liye useful hai:

features[item.featureKey] !== false

Baad mein iske saath member permission bhi check hogi:

featureEnabled && hasPermission(item.permission)
5. Subscription system

Har deployment mein subscription ki ek current row ho sakti hai:

subscription
- plan
- start_date
- end_date
- grace_period_days
- is_active
- renewal_code
- updated_by

Super Admin:

Plan select karega
Start/end date set karega
Grace period set karega
Subscription activate/deactivate karega
Renewal code update karega

Owner/Admin sirf status dekh sakenge; change nahi karenge.

Tumhara existing SubscriptionProvider, SubscriptionBanner aur expired-screen isi approach mein reuse honge.

6. Account creation system
Super Admin

Har naye business deployment mein server/Admin API se manually create hoga:

Auth user create
→ email confirmed
→ profiles role = superadmin
Owner

Client setup ke waqt manually create hoga:

Auth user create
→ email confirmed
→ profiles role = owner
Other roles

Owner/Admin dashboard ke Team page se create honge:

Full name
Email
Password
Role
Permissions
Active status

Server-side function:

supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

Phir profile:

role = admin/manager/supervisor/staff
created_by = current user ID

Service-role key sirf server-side use hogi.

7. Login flow

Sab users same login page use karenge.

Email/password
      ↓
Supabase authentication
      ↓
Profile load
      ↓
Active status check
      ↓
Role check

Routing:

if (profile.role === "superadmin") {
  router.replace("/super-admin/dashboard");
} else {
  router.replace("/dashboard");
}

Super Admin ko dono areas access honge:

/super-admin/*
/dashboard
/crm/*
/appointments/*
/website/*
/system/*

Normal users:

/dashboard aur permitted modules

Owner ko /super-admin/* access nahi milega.

8. Existing code mein required changes

Tumhara current project reuse hoga:

Root layout reuse
Login design reuse
Dashboard layout reuse
Sidebar reuse
Super Admin dashboard reuse
Feature provider reuse
Subscription provider reuse
Supabase connection reuse
Shadcn components reuse

Main improvement ye hoga:

Current:
Role check mostly client-side

Final:
Server authorization + RLS + client UI filtering

Security ki teen layers hongi:

1. Route protection
2. Server action permission checks
3. Supabase RLS

Sidebar item hide karna sirf UI hai, security nahi. Agar Staff URL manually open kare tab bhi server/RLS usay block karega.

Final corrected plan
Phase 1 — Authentication and roles
Existing Supabase schema inspect karna
Profiles mein six roles define karna
Manual Super Admin and Owner creation process
Owner/Admin member creation server action
Login routing
User active/inactive control
Protected dashboard layouts
Password administrative reset
Phase 2 — Hybrid permissions
Permission keys define karna
Default role permissions seed karna
Individual member overrides
Permission-check helper
Sidebar filtering
Route and server-action security
RLS policies
Phase 3 — Existing systems integration
FeaturesProvider ko permissions ke saath connect karna
Subscription restrictions secure karna
Super Admin routes secure karna
Activity logs add karna