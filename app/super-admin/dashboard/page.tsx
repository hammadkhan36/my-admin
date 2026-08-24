"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdminConfig } from "@/components/admin-config-provider";
import { toast } from "sonner";
import { LogOut, Save, ShieldCheck, Lock, KeyRound, CalendarClock } from "lucide-react";
import { masterConfig } from "@/lib/master-config";

export default function SuperAdminDashboard() {
    const router = useRouter();
    const { config, updateSubscription, updateLockFeature, updateRenewalCode } = useAdminConfig();
    const [renewalCode, setRenewalCode] = useState(config.renewalCode);
    const [isAuthed, setIsAuthed] = useState(false);



    // Protect route
    useEffect(() => {
        const auth = sessionStorage.getItem("isSuperAdmin");
        if (!auth) {
            router.push("/super-admin/login");
        } else {
            setIsAuthed(true);
        }
    }, [router]);

    // Local states for forms
    const [sub, setSub] = useState(config.subscription);
    const [featureLocks, setFeatureLocks] = useState(config.lockedFeatures);

    const handleSubChange = (field: string, value: string | number | boolean) => {
        setSub((prev) => ({ ...prev, [field]: value }));
    };

    const handlePlanChange = (plan: string) => {
        setSub((prev) => ({
            ...prev,
            plan: plan as any,
            // If lifetime, set endDate far future
            endDate: plan === "lifetime" ? "2099-12-31" : prev.endDate,
        }));
    };

    const saveSubscription = () => {
        updateSubscription(sub);
        toast.success("Subscription settings saved!");
    };

    const toggleFeatureLock = (key: string, locked: boolean) => {
        setFeatureLocks((prev) =>
            prev.map((lock) => (lock.key === key ? { ...lock, locked } : lock))
        );
    };

    const updateUnlockCode = (key: string, code: string) => {
        setFeatureLocks((prev) =>
            prev.map((lock) => (lock.key === key ? { ...lock, unlockCode: code } : lock))
        );
    };

    const saveFeatureLocks = () => {
        featureLocks.forEach((lock) => {
            updateLockFeature(lock.key, lock.locked, lock.unlockCode);
        });
        toast.success("Feature locks updated!");
    };

    const logout = () => {
        sessionStorage.removeItem("isSuperAdmin");
        router.push("/super-admin/login");
    };

    if (!isAuthed) return null;

    const subscription = config.subscription;
    const isLifetime = subscription.plan === "lifetime";
    const isActive = subscription.isActive && (!isLifetime ? new Date(subscription.endDate) > new Date() : true);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold">Super Admin Control Panel</h1>
                            <p className="text-muted-foreground">Manage subscription and feature locks</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold capitalize">{subscription.plan}</p>
                            {isLifetime && <Badge variant="secondary">Lifetime</Badge>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Expiry Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{isLifetime ? "Never" : subscription.endDate}</p>
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

                {/* Main Tabs */}
                <Tabs defaultValue="subscription" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="subscription">
                            <CalendarClock className="mr-2 h-4 w-4" /> Subscription
                        </TabsTrigger>
                        <TabsTrigger value="features">
                            <Lock className="mr-2 h-4 w-4" /> Feature Locks
                        </TabsTrigger>
                    </TabsList>

                    {/* Subscription Tab */}
                    <TabsContent value="subscription">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subscription Settings</CardTitle>
                                <CardDescription>Manage plan, dates, and grace period</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Plan</Label>
                                        <select
                                            value={sub.plan}
                                            onChange={(e) => handlePlanChange(e.target.value)}
                                            className="w-full border rounded-md px-3 py-2 mt-1"
                                        >
                                            <option value="one-time">One-Time</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="half-yearly">Half-Yearly</option>
                                            <option value="yearly">Yearly</option>
                                            <option value="lifetime">Lifetime</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Active</Label>
                                        <div className="mt-2">
                                            <Switch
                                                checked={sub.isActive}
                                                onCheckedChange={(checked) => handleSubChange("isActive", checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {sub.plan !== "lifetime" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>Start Date</Label>
                                            <Input
                                                type="date"
                                                value={sub.startDate}
                                                onChange={(e) => handleSubChange("startDate", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>End Date</Label>
                                            <Input
                                                type="date"
                                                value={sub.endDate}
                                                onChange={(e) => handleSubChange("endDate", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Grace Period (days)</Label>
                                            <Input
                                                type="number"
                                                value={sub.gracePeriodDays}
                                                onChange={(e) => handleSubChange("gracePeriodDays", Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            Lifetime plan has no expiry date. Set start date only if needed.
                                        </p>
                                        <div className="mt-2">
                                            <Label>Start Date</Label>
                                            <Input
                                                type="date"
                                                value={sub.startDate}
                                                onChange={(e) => handleSubChange("startDate", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Separator />
                                <div className="flex justify-end">
                                    <Button onClick={saveSubscription}>
                                        <Save className="mr-2 h-4 w-4" /> Save Subscription
                                    </Button>
                                </div>

                // In Subscription Tab, add a block for renewal code:
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Renewal Code</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={renewalCode}
                                            onChange={(e) => setRenewalCode(e.target.value)}
                                            placeholder="Enter new renewal code"
                                            className="h-9"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                updateRenewalCode(renewalCode);
                                                toast.success("Renewal code updated!");
                                            }}
                                        >
                                            Update Code
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Feature Locks Tab */}
                    <TabsContent value="features">
                        <Card>
                            <CardHeader>
                                <CardTitle>Feature Lock Management</CardTitle>
                                <CardDescription>Lock or unlock modules, set secret codes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {featureLocks.map((lock) => (
                                    <div
                                        key={lock.key}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium capitalize">{lock.key}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {lock.locked ? "Currently locked" : "Unlocked"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={lock.locked}
                                                    onCheckedChange={(checked) => toggleFeatureLock(lock.key, checked)}
                                                />
                                                <span>{lock.locked ? "Locked" : "Unlocked"}</span>
                                            </div>
                                            <div className="w-40">
                                                <Input
                                                    value={lock.unlockCode}
                                                    onChange={(e) => updateUnlockCode(lock.key, e.target.value)}
                                                    placeholder="Unlock code"
                                                    disabled={!lock.locked}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-end">
                                    <Button onClick={saveFeatureLocks}>
                                        <Save className="mr-2 h-4 w-4" /> Save Feature Locks
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}