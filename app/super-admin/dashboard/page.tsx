// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Label } from "@/components/ui/label";
// // import { Input } from "@/components/ui/input";
// // import { Switch } from "@/components/ui/switch";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import { useAdminConfig } from "@/components/admin-config-provider";
// // import { toast } from "sonner";
// // import { LogOut, Save, ShieldCheck, Lock, KeyRound, CalendarClock } from "lucide-react";
// // import { masterConfig } from "@/lib/master-config";

// // export default function SuperAdminDashboard() {
// //     const router = useRouter();
// //     const { config, updateSubscription, updateLockFeature, updateRenewalCode } = useAdminConfig();
// //     const [renewalCode, setRenewalCode] = useState(config.renewalCode);
// //     const [isAuthed, setIsAuthed] = useState(false);



// //     // Protect route
// //     useEffect(() => {
// //         const auth = sessionStorage.getItem("isSuperAdmin");
// //         if (!auth) {
// //             router.push("/super-admin/login");
// //         } else {
// //             setIsAuthed(true);
// //         }
// //     }, [router]);

// //     // Local states for forms
// //     const [sub, setSub] = useState(config.subscription);
// //     const [featureLocks, setFeatureLocks] = useState(config.lockedFeatures);

// //     const handleSubChange = (field: string, value: string | number | boolean) => {
// //         setSub((prev) => ({ ...prev, [field]: value }));
// //     };

// //     const handlePlanChange = (plan: string) => {
// //         setSub((prev) => ({
// //             ...prev,
// //             plan: plan as any,
// //             // If lifetime, set endDate far future
// //             endDate: plan === "lifetime" ? "2099-12-31" : prev.endDate,
// //         }));
// //     };

// //     const saveSubscription = () => {
// //         updateSubscription(sub);
// //         toast.success("Subscription settings saved!");
// //     };

// //     const toggleFeatureLock = (key: string, locked: boolean) => {
// //         setFeatureLocks((prev) =>
// //             prev.map((lock) => (lock.key === key ? { ...lock, locked } : lock))
// //         );
// //     };

// //     const updateUnlockCode = (key: string, code: string) => {
// //         setFeatureLocks((prev) =>
// //             prev.map((lock) => (lock.key === key ? { ...lock, unlockCode: code } : lock))
// //         );
// //     };

// //     const saveFeatureLocks = () => {
// //         featureLocks.forEach((lock) => {
// //             updateLockFeature(lock.key, lock.locked, lock.unlockCode);
// //         });
// //         toast.success("Feature locks updated!");
// //     };

// //     const logout = () => {
// //         sessionStorage.removeItem("isSuperAdmin");
// //         router.push("/super-admin/login");
// //     };

// //     if (!isAuthed) return null;

// //     const subscription = config.subscription;
// //     const isLifetime = subscription.plan === "lifetime";
// //     const isActive = subscription.isActive && (!isLifetime ? new Date(subscription.endDate) > new Date() : true);

// //     return (
// //         <div className="min-h-screen bg-background p-4 md:p-8">
// //             <div className="max-w-6xl mx-auto">
// //                 {/* Header */}
// //                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
// //                     <div className="flex items-center gap-3">
// //                         <ShieldCheck className="h-8 w-8 text-primary" />
// //                         <div>
// //                             <h1 className="text-2xl font-bold">Super Admin Control Panel</h1>
// //                             <p className="text-muted-foreground">Manage subscription and feature locks</p>
// //                         </div>
// //                     </div>
// //                     <Button variant="outline" onClick={logout}>
// //                         <LogOut className="mr-2 h-4 w-4" /> Logout
// //                     </Button>
// //                 </div>

// //                 {/* Summary Cards */}
// //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
// //                     <Card>
// //                         <CardHeader className="pb-2">
// //                             <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
// //                         </CardHeader>
// //                         <CardContent>
// //                             <p className="text-2xl font-bold capitalize">{subscription.plan}</p>
// //                             {isLifetime && <Badge variant="secondary">Lifetime</Badge>}
// //                         </CardContent>
// //                     </Card>
// //                     <Card>
// //                         <CardHeader className="pb-2">
// //                             <CardTitle className="text-sm font-medium">Expiry Date</CardTitle>
// //                         </CardHeader>
// //                         <CardContent>
// //                             <p className="text-2xl font-bold">{isLifetime ? "Never" : subscription.endDate}</p>
// //                         </CardContent>
// //                     </Card>
// //                     <Card>
// //                         <CardHeader className="pb-2">
// //                             <CardTitle className="text-sm font-medium">Status</CardTitle>
// //                         </CardHeader>
// //                         <CardContent>
// //                             <Badge variant={isActive ? "secondary" : "destructive"} className="text-sm">
// //                                 {isActive ? "Active" : "Inactive / Expired"}
// //                             </Badge>
// //                         </CardContent>
// //                     </Card>
// //                 </div>

// //                 {/* Main Tabs */}
// //                 <Tabs defaultValue="subscription" className="w-full">
// //                     <TabsList className="mb-6">
// //                         <TabsTrigger value="subscription">
// //                             <CalendarClock className="mr-2 h-4 w-4" /> Subscription
// //                         </TabsTrigger>
// //                         <TabsTrigger value="features">
// //                             <Lock className="mr-2 h-4 w-4" /> Feature Locks
// //                         </TabsTrigger>
// //                     </TabsList>

// //                     {/* Subscription Tab */}
// //                     <TabsContent value="subscription">
// //                         <Card>
// //                             <CardHeader>
// //                                 <CardTitle>Subscription Settings</CardTitle>
// //                                 <CardDescription>Manage plan, dates, and grace period</CardDescription>
// //                             </CardHeader>
// //                             <CardContent className="space-y-6">
// //                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                                     <div>
// //                                         <Label>Plan</Label>
// //                                         <select
// //                                             value={sub.plan}
// //                                             onChange={(e) => handlePlanChange(e.target.value)}
// //                                             className="w-full border rounded-md px-3 py-2 mt-1"
// //                                         >
// //                                             <option value="one-time">One-Time</option>
// //                                             <option value="monthly">Monthly</option>
// //                                             <option value="half-yearly">Half-Yearly</option>
// //                                             <option value="yearly">Yearly</option>
// //                                             <option value="lifetime">Lifetime</option>
// //                                         </select>
// //                                     </div>
// //                                     <div>
// //                                         <Label>Active</Label>
// //                                         <div className="mt-2">
// //                                             <Switch
// //                                                 checked={sub.isActive}
// //                                                 onCheckedChange={(checked) => handleSubChange("isActive", checked)}
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                 </div>

// //                                 {sub.plan !== "lifetime" ? (
// //                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                                         <div>
// //                                             <Label>Start Date</Label>
// //                                             <Input
// //                                                 type="date"
// //                                                 value={sub.startDate}
// //                                                 onChange={(e) => handleSubChange("startDate", e.target.value)}
// //                                             />
// //                                         </div>
// //                                         <div>
// //                                             <Label>End Date</Label>
// //                                             <Input
// //                                                 type="date"
// //                                                 value={sub.endDate}
// //                                                 onChange={(e) => handleSubChange("endDate", e.target.value)}
// //                                             />
// //                                         </div>
// //                                         <div>
// //                                             <Label>Grace Period (days)</Label>
// //                                             <Input
// //                                                 type="number"
// //                                                 value={sub.gracePeriodDays}
// //                                                 onChange={(e) => handleSubChange("gracePeriodDays", Number(e.target.value))}
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                 ) : (
// //                                     <div className="bg-muted/50 p-4 rounded-lg">
// //                                         <p className="text-sm text-muted-foreground">
// //                                             Lifetime plan has no expiry date. Set start date only if needed.
// //                                         </p>
// //                                         <div className="mt-2">
// //                                             <Label>Start Date</Label>
// //                                             <Input
// //                                                 type="date"
// //                                                 value={sub.startDate}
// //                                                 onChange={(e) => handleSubChange("startDate", e.target.value)}
// //                                             />
// //                                         </div>
// //                                     </div>
// //                                 )}

// //                                 <Separator />
// //                                 <div className="flex justify-end">
// //                                     <Button onClick={saveSubscription}>
// //                                         <Save className="mr-2 h-4 w-4" /> Save Subscription
// //                                     </Button>
// //                                 </div>

// //                 // In Subscription Tab, add a block for renewal code:
// //                                 <Separator />
// //                                 <div className="space-y-2">
// //                                     <Label>Renewal Code</Label>
// //                                     <div className="flex gap-2">
// //                                         <Input
// //                                             value={renewalCode}
// //                                             onChange={(e) => setRenewalCode(e.target.value)}
// //                                             placeholder="Enter new renewal code"
// //                                             className="h-9"
// //                                         />
// //                                         <Button
// //                                             variant="outline"
// //                                             onClick={() => {
// //                                                 updateRenewalCode(renewalCode);
// //                                                 toast.success("Renewal code updated!");
// //                                             }}
// //                                         >
// //                                             Update Code
// //                                         </Button>
// //                                     </div>
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                     </TabsContent>

// //                     {/* Feature Locks Tab */}
// //                     <TabsContent value="features">
// //                         <Card>
// //                             <CardHeader>
// //                                 <CardTitle>Feature Lock Management</CardTitle>
// //                                 <CardDescription>Lock or unlock modules, set secret codes</CardDescription>
// //                             </CardHeader>
// //                             <CardContent className="space-y-4">
// //                                 {featureLocks.map((lock) => (
// //                                     <div
// //                                         key={lock.key}
// //                                         className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3"
// //                                     >
// //                                         <div className="flex-1">
// //                                             <p className="font-medium capitalize">{lock.key}</p>
// //                                             <p className="text-xs text-muted-foreground">
// //                                                 {lock.locked ? "Currently locked" : "Unlocked"}
// //                                             </p>
// //                                         </div>
// //                                         <div className="flex items-center gap-3">
// //                                             <div className="flex items-center gap-2">
// //                                                 <Switch
// //                                                     checked={lock.locked}
// //                                                     onCheckedChange={(checked) => toggleFeatureLock(lock.key, checked)}
// //                                                 />
// //                                                 <span>{lock.locked ? "Locked" : "Unlocked"}</span>
// //                                             </div>
// //                                             <div className="w-40">
// //                                                 <Input
// //                                                     value={lock.unlockCode}
// //                                                     onChange={(e) => updateUnlockCode(lock.key, e.target.value)}
// //                                                     placeholder="Unlock code"
// //                                                     disabled={!lock.locked}
// //                                                     className="h-8 text-xs"
// //                                                 />
// //                                             </div>
// //                                         </div>
// //                                     </div>
// //                                 ))}
// //                                 <Separator />
// //                                 <div className="flex justify-end">
// //                                     <Button onClick={saveFeatureLocks}>
// //                                         <Save className="mr-2 h-4 w-4" /> Save Feature Locks
// //                                     </Button>
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                     </TabsContent>
// //                 </Tabs>
// //             </div>
// //         </div>
// //     );
// // }






// // new code after supabase integration

// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase-browser";
// import { useSupabaseConfig } from "@/components/supabase-config-provider";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "sonner";
// import { LogOut, Save, ShieldCheck, Lock, CalendarClock, Building2 } from "lucide-react";

// export default function SuperAdminDashboard() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { businessSettings, featureSettings, subscription, updateBusinessSetting, updateFeatureSetting, updateSubscription, refreshData } = useSupabaseConfig();

//   const [isLoading, setIsLoading] = React.useState(true);
//   const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);

//   // Form states (initialized from DB data)
//   const [business, setBusiness] = React.useState({
//     business_name: "",
//     short_name: "",
//     logo_url: "",
//     favicon_url: "",
//     theme_color: "#2563eb",
//     contact_email: "",
//     contact_phone: "",
//   });
//   const [sub, setSub] = React.useState({
//     plan: "monthly",
//     start_date: "",
//     end_date: "",
//     grace_period_days: 7,
//     is_active: true,
//     renewal_code: "",
//   });
//   const [featureLocks, setFeatureLocks] = React.useState(featureSettings);

//   // Auth check
//   React.useEffect(() => {
//     const checkAuth = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.replace("/");
//         return;
//       }
//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", user.id)
//         .single();
//       if (profile?.role === "superadmin") {
//         setIsSuperAdmin(true);
//       } else {
//         router.replace("/404");
//       }
//       setIsLoading(false);
//     };
//     checkAuth();
//   }, []);

//   // Sync DB data to form states
//   React.useEffect(() => {
//     if (businessSettings) {
//       setBusiness({
//         business_name: businessSettings.business_name || "",
//         short_name: businessSettings.short_name || "",
//         logo_url: businessSettings.logo_url || "",
//         favicon_url: businessSettings.favicon_url || "",
//         theme_color: businessSettings.theme_color || "#2563eb",
//         contact_email: businessSettings.contact_email || "",
//         contact_phone: businessSettings.contact_phone || "",
//       });
//     }
//     if (subscription) {
//       setSub({
//         plan: subscription.plan || "monthly",
//         start_date: subscription.start_date || "",
//         end_date: subscription.end_date || "",
//         grace_period_days: subscription.grace_period_days || 7,
//         is_active: subscription.is_active ?? true,
//         renewal_code: subscription.renewal_code || "",
//       });
//     }
//     if (featureSettings) {
//       setFeatureLocks(featureSettings);
//     }
//   }, [businessSettings, subscription, featureSettings]);

//   const handleSaveAll = async () => {
//     try {
//       // Update subscription
//       if (subscription) {
//         await updateSubscription({
//           plan: sub.plan,
//           start_date: sub.start_date,
//           end_date: sub.end_date,
//           grace_period_days: sub.grace_period_days,
//           is_active: sub.is_active,
//           renewal_code: sub.renewal_code,
//         });
//       }
//       // Update feature settings
//       for (const lock of featureLocks) {
//         await updateFeatureSetting(lock.feature_key, lock.enabled, lock.locked, lock.unlock_code);
//       }
//       // Update business settings
//       await updateBusinessSetting("business_name", business.business_name);
//       await updateBusinessSetting("short_name", business.short_name);
//       await updateBusinessSetting("logo_url", business.logo_url);
//       await updateBusinessSetting("favicon_url", business.favicon_url);
//       await updateBusinessSetting("theme_color", business.theme_color);
//       await updateBusinessSetting("contact_email", business.contact_email);
//       await updateBusinessSetting("contact_phone", business.contact_phone);

//       toast.success("All settings saved successfully!");
//       await refreshData();
//     } catch (err) {
//       toast.error("Failed to save settings.");
//     }
//   };

//   const logout = async () => {
//     await supabase.auth.signOut();
//     router.push("/");
//   };

//   if (isLoading) return <div className="p-8 text-center">Loading...</div>;
//   if (!isSuperAdmin) return null;

//   const isLifetime = sub.plan === "lifetime";
//   const isActive = sub.is_active && (isLifetime || new Date(sub.end_date) > new Date());

//   return (
//     <div className="min-h-screen bg-background p-4 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//           <div className="flex items-center gap-3">
//             <ShieldCheck className="h-8 w-8 text-primary" />
//             <div>
//               <h1 className="text-2xl font-bold">Super Admin Control Panel</h1>
//               <p className="text-muted-foreground">Manage business, subscription, and feature locks</p>
//             </div>
//           </div>
//           <Button variant="outline" onClick={logout}>
//             <LogOut className="mr-2 h-4 w-4" /> Logout
//           </Button>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <Card>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Current Plan</CardTitle></CardHeader>
//             <CardContent>
//               <p className="text-2xl font-bold capitalize">{sub.plan}</p>
//               {isLifetime && <Badge variant="secondary">Lifetime</Badge>}
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Expiry Date</CardTitle></CardHeader>
//             <CardContent><p className="text-2xl font-bold">{isLifetime ? "Never" : sub.end_date || "N/A"}</p></CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
//             <CardContent>
//               <Badge variant={isActive ? "secondary" : "destructive"} className="text-sm">
//                 {isActive ? "Active" : "Inactive / Expired"}
//               </Badge>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tabs */}
//         <Tabs defaultValue="business" className="w-full">
//           <TabsList className="mb-6">
//             <TabsTrigger value="business"><Building2 className="mr-2 h-4 w-4" /> Business</TabsTrigger>
//             <TabsTrigger value="subscription"><CalendarClock className="mr-2 h-4 w-4" /> Subscription</TabsTrigger>
//             <TabsTrigger value="features"><Lock className="mr-2 h-4 w-4" /> Feature Locks</TabsTrigger>
//           </TabsList>

//           {/* Business Tab */}
//           <TabsContent value="business">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Business Settings</CardTitle>
//                 <CardDescription>Manage branding and contact info</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label>Business Name</Label>
//                     <Input value={business.business_name} onChange={(e) => setBusiness({ ...business, business_name: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Short Name</Label>
//                     <Input value={business.short_name} onChange={(e) => setBusiness({ ...business, short_name: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Logo URL</Label>
//                     <Input value={business.logo_url} onChange={(e) => setBusiness({ ...business, logo_url: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Favicon URL</Label>
//                     <Input value={business.favicon_url} onChange={(e) => setBusiness({ ...business, favicon_url: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Theme Color</Label>
//                     <Input value={business.theme_color} onChange={(e) => setBusiness({ ...business, theme_color: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Contact Email</Label>
//                     <Input value={business.contact_email} onChange={(e) => setBusiness({ ...business, contact_email: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Contact Phone</Label>
//                     <Input value={business.contact_phone} onChange={(e) => setBusiness({ ...business, contact_phone: e.target.value })} />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Subscription Tab */}
//           <TabsContent value="subscription">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Subscription Settings</CardTitle>
//                 <CardDescription>Manage plan, dates, grace period, and renewal code</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <Label>Plan</Label>
//                     <select value={sub.plan} onChange={(e) => setSub({ ...sub, plan: e.target.value, end_date: e.target.value === "lifetime" ? "2099-12-31" : sub.end_date })} className="w-full border rounded-md px-3 py-2 mt-1">
//                       <option value="one-time">One-Time</option>
//                       <option value="monthly">Monthly</option>
//                       <option value="half-yearly">Half-Yearly</option>
//                       <option value="yearly">Yearly</option>
//                       <option value="lifetime">Lifetime</option>
//                     </select>
//                   </div>
//                   <div>
//                     <Label>Active</Label>
//                     <div className="mt-2"><Switch checked={sub.is_active} onCheckedChange={(checked) => setSub({ ...sub, is_active: checked })} /></div>
//                   </div>
//                 </div>

//                 {sub.plan !== "lifetime" ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <Label>Start Date</Label>
//                       <Input type="date" value={sub.start_date} onChange={(e) => setSub({ ...sub, start_date: e.target.value })} />
//                     </div>
//                     <div>
//                       <Label>End Date</Label>
//                       <Input type="date" value={sub.end_date} onChange={(e) => setSub({ ...sub, end_date: e.target.value })} />
//                     </div>
//                     <div>
//                       <Label>Grace Period (days)</Label>
//                       <Input type="number" value={sub.grace_period_days} onChange={(e) => setSub({ ...sub, grace_period_days: Number(e.target.value) })} />
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-muted/50 p-4 rounded-lg">
//                     <p className="text-sm text-muted-foreground">Lifetime plan has no expiry date.</p>
//                   </div>
//                 )}

//                 <Separator />
//                 <div className="space-y-2">
//                   <Label>Renewal Code</Label>
//                   <div className="flex gap-2">
//                     <Input value={sub.renewal_code} onChange={(e) => setSub({ ...sub, renewal_code: e.target.value })} placeholder="Enter renewal code" className="h-9" />
//                     <Button variant="outline" onClick={async () => { await updateSubscription({ renewal_code: sub.renewal_code }); toast.success("Renewal code updated!"); }}>Update Code</Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Feature Locks Tab */}
//           <TabsContent value="features">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Feature Lock Management</CardTitle>
//                 <CardDescription>Enable/disable, lock/unlock modules, set secret codes</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {featureLocks.map((lock) => (
//                   <div key={lock.feature_key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
//                     <div className="flex-1">
//                       <p className="font-medium capitalize">{lock.feature_key}</p>
//                       <p className="text-xs text-muted-foreground">{lock.locked ? "Locked" : "Unlocked"}</p>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="flex items-center gap-2">
//                         <span>Enabled</span>
//                         <Switch checked={lock.enabled} onCheckedChange={(checked) => setFeatureLocks(prev => prev.map(l => l.feature_key === lock.feature_key ? { ...l, enabled: checked } : l))} />
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span>Locked</span>
//                         <Switch checked={lock.locked} onCheckedChange={(checked) => setFeatureLocks(prev => prev.map(l => l.feature_key === lock.feature_key ? { ...l, locked: checked } : l))} />
//                       </div>
//                       <div className="w-40">
//                         <Input value={lock.unlock_code || ""} onChange={(e) => setFeatureLocks(prev => prev.map(l => l.feature_key === lock.feature_key ? { ...l, unlock_code: e.target.value } : l))} placeholder="Unlock code" disabled={!lock.locked} className="h-8 text-xs" />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         {/* Save All Button */}
//         <div className="mt-6 flex justify-end">
//           <Button onClick={handleSaveAll} size="lg">
//             <Save className="mr-2 h-4 w-4" /> Save All Changes
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }













import { CalendarClock, Lock, Save, ShieldCheck, Building2 } from "lucide-react";
import { updateBusinessSettings, updateFeatureSetting, updateSubscriptionSettings } from "@/app/super-admin/dashboard/actions";
import { requireSuperAdmin } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase-server";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BusinessSettings = {
  id: string;
  business_name: string | null;
  short_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  theme_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

type FeatureSetting = {
  feature_key: string;
  enabled: boolean;
  locked: boolean;
  unlock_code: string | null;
};

type Subscription = {
  id: string;
  plan: string;
  start_date: string | null;
  end_date: string | null;
  grace_period_days: number;
  is_active: boolean;
  renewal_code: string | null;
};

export default async function SuperAdminDashboard() {
  await requireSuperAdmin();

  const supabase = await createClient();

  const [{ data: business }, { data: subscription }, { data: features }] =
    await Promise.all([
      supabase.from("business_settings").select("*").limit(1).single(),
      supabase.from("subscriptions").select("*").limit(1).single(),
      supabase.from("feature_settings").select("*").order("feature_key"),
    ]);

  const businessSettings = business as BusinessSettings | null;
  const sub = subscription as Subscription | null;
  const featureSettings = (features ?? []) as FeatureSetting[];

  const isLifetime = sub?.plan === "lifetime";
  const isActive =
    !!sub?.is_active &&
    (isLifetime || (!!sub?.end_date && new Date(sub.end_date) > new Date()));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Super Admin Control Panel</h1>
              <p className="text-muted-foreground">
                Manage business setup, subscription and feature locks.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize">{sub?.plan || "N/A"}</p>
              {isLifetime && <Badge variant="secondary">Lifetime</Badge>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expiry Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {isLifetime ? "Never" : sub?.end_date || "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isActive ? "secondary" : "destructive"} className="text-sm">
                {isActive ? "Active" : "Inactive / Expired"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="business">
              <Building2 className="mr-2 h-4 w-4" /> Business
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CalendarClock className="mr-2 h-4 w-4" /> Subscription
            </TabsTrigger>
            <TabsTrigger value="features">
              <Lock className="mr-2 h-4 w-4" /> Feature Locks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Branding and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                {businessSettings ? (
                  <form
                    key={`business-${businessSettings.id}-${businessSettings.business_name}-${businessSettings.short_name}-${businessSettings.logo_url}-${businessSettings.favicon_url}-${businessSettings.theme_color}-${businessSettings.contact_email}-${businessSettings.contact_phone}`}
                    action={updateBusinessSettings}
                    className="space-y-4"
                  >
                    <input type="hidden" name="id" value={businessSettings.id} />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input id="business_name" name="business_name" defaultValue={businessSettings.business_name ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="short_name">Short Name</Label>
                        <Input id="short_name" name="short_name" defaultValue={businessSettings.short_name ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logo_url">Logo URL</Label>
                        <Input id="logo_url" name="logo_url" defaultValue={businessSettings.logo_url ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="favicon_url">Favicon URL</Label>
                        <Input id="favicon_url" name="favicon_url" defaultValue={businessSettings.favicon_url ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theme_color">Theme Color</Label>
                        <Input id="theme_color" name="theme_color" defaultValue={businessSettings.theme_color ?? "#2563eb"} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Contact Email</Label>
                        <Input id="contact_email" name="contact_email" defaultValue={businessSettings.contact_email ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Contact Phone</Label>
                        <Input id="contact_phone" name="contact_phone" defaultValue={businessSettings.contact_phone ?? ""} />
                      </div>
                    </div>

                    <PendingSubmitButton pendingText="Saving business...">
                      <Save className="mr-2 h-4 w-4" /> Save Business Settings
                    </PendingSubmitButton>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Business settings row not found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Settings</CardTitle>
                <CardDescription>Plan, dates, grace period and renewal code.</CardDescription>
              </CardHeader>
              <CardContent>
                {sub ? (
                  <form
                    key={`subscription-${sub.id}-${sub.plan}-${sub.start_date}-${sub.end_date}-${sub.grace_period_days}-${sub.is_active}-${sub.renewal_code}`}
                    action={updateSubscriptionSettings}
                    className="space-y-6"
                  >
                    <input type="hidden" name="id" value={sub.id} />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="plan">Plan</Label>
                        <select id="plan" name="plan" defaultValue={sub.plan} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                          <option value="one-time">One-Time</option>
                          <option value="monthly">Monthly</option>
                          <option value="half-yearly">Half-Yearly</option>
                          <option value="yearly">Yearly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="is_active">Active</Label>
                        <div className="pt-2">
                          <Switch id="is_active" name="is_active" defaultChecked={sub.is_active} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" name="start_date" type="date" defaultValue={sub.start_date ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" name="end_date" type="date" defaultValue={sub.end_date ?? ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grace_period_days">Grace Period Days</Label>
                        <Input id="grace_period_days" name="grace_period_days" type="number" defaultValue={sub.grace_period_days} />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="renewal_code">Renewal Code</Label>
                      <Input id="renewal_code" name="renewal_code" defaultValue={sub.renewal_code ?? ""} />
                    </div>

                    <PendingSubmitButton pendingText="Saving subscription...">
                      <Save className="mr-2 h-4 w-4" /> Save Subscription
                    </PendingSubmitButton>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Subscription row not found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <div className="space-y-4">
              {featureSettings.map((feature) => (
                <Card key={feature.feature_key}>
                  <CardContent className="p-4">
                    <form
                      key={`feature-${feature.feature_key}-${feature.enabled}-${feature.locked}-${feature.unlock_code}`}
                      action={updateFeatureSetting} className="grid gap-4 md:grid-cols-[1fr_auto_auto_220px_auto] md:items-end">
                      <input type="hidden" name="feature_key" value={feature.feature_key} />

                      <div>
                        <div className="font-medium capitalize">{feature.feature_key}</div>
                        <div className="text-xs text-muted-foreground">
                          {feature.enabled ? "Enabled" : "Disabled"} / {feature.locked ? "Locked" : "Unlocked"}
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <Switch name="enabled" defaultChecked={feature.enabled} />
                        Enabled
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <Switch name="locked" defaultChecked={feature.locked} />
                        Locked
                      </label>

                      <div className="space-y-2">
                        <Label htmlFor={`unlock-${feature.feature_key}`}>Unlock Code</Label>
                        <Input
                          id={`unlock-${feature.feature_key}`}
                          name="unlock_code"
                          defaultValue={feature.unlock_code ?? ""}
                        />
                      </div>

                      <PendingSubmitButton size="sm" pendingText="Saving...">
                        Save
                      </PendingSubmitButton>
                    </form>
                  </CardContent>
                </Card>
              ))}

              {featureSettings.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    No feature settings found.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}