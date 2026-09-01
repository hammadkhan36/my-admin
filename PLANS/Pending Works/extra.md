


Done	Matlab
Supabase auth tables + roles migration	profiles, permissions, role_permissions, user_permission_overrides, audit logs, feature/subscription base
Manual superadmin + owner setup	Ye dono dashboard se create nahi honge, sirf Supabase se
lib/auth/roles.ts	Role names central jagah par
lib/auth/server.ts	Server-side login, active user, permission checks
AuthProvider	Client components ko profile + permissions milti hain
(admin)/layout.tsx protected	Dashboard anonymous/inactive user se protected
super-admin/layout.tsx protected	Super admin route only superadmin
supabase-admin.ts	Server se Supabase users create karne ke liye
staff actions	Admin/owner future mein members create + active/inactive kar sakenge

Ab jo remaining hai:

Remaining	Kyun zaroori
Staff UI page	Add member form/table dashboard mein dikhana
Login form polish	inactive user logout, role redirect final check
Sidebar permission mapping	Menu role/permission ke hisaab se show/hide
Route-level permission guards	Sirf sidebar hide enough nahi; pages bhi protect hon
Individual permission override UI	Hybrid system ka main part: per-member permission on/off
Password reset/change by owner/admin	Member khud password change nahi karega
Docs	Future setup ke liye exact guide