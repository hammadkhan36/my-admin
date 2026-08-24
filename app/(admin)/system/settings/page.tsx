"use client";

import { useState } from "react";
import { defaultSettings, Settings } from "@/lib/system-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, HelpCircle, FileText, LifeBuoy, AlertTriangle } from "lucide-react";

import { useFeatures } from "@/components/features-provider";
import { FeaturesSettings } from "@/components/features-settings";
import { Features, FeatureKey } from "@/lib/features-config";
import { toast } from "sonner";

export default function SettingsPage() {
     const { features, setFeature } = useFeatures();
  const [draftFeatures, setDraftFeatures] = useState<Features>(features);
    const [settings, setSettings] = useState<Settings>(defaultSettings);


      const handleFeatureToggle = (key: FeatureKey) => {
    setDraftFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };


   const handleSaveAll = () => {
    // Apply draft features to context
    Object.entries(draftFeatures).forEach(([key, value]) => {
      setFeature(key as FeatureKey, value);
    });
    // Save other settings (if needed)
    // Here you would also save general settings, notifications, etc.
    // For now, just show toast
    toast.success("Settings saved successfully!");
  };


    const updateSetting = (
        section: keyof Settings,
        key: string,
        value: string | boolean
    ) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <Button onClick={handleSaveAll}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6 flex flex-wrap">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="help">Help</TabsTrigger>
                    <TabsTrigger value="features">Features & Modules</TabsTrigger>
                </TabsList>

                {/* General */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Business preferences and defaults</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Business Name</Label>
                                <Input
                                    value={settings.general.businessName}
                                    onChange={(e) => updateSetting("general", "businessName", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Timezone</Label>
                                <Input
                                    value={settings.general.timezone}
                                    onChange={(e) => updateSetting("general", "timezone", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Currency</Label>
                                <Input
                                    value={settings.general.currency}
                                    onChange={(e) => updateSetting("general", "currency", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Default Language</Label>
                                <Input
                                    value={settings.general.defaultLanguage}
                                    onChange={(e) => updateSetting("general", "defaultLanguage", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Configure email and system notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: "emailNotifications", label: "Email Notifications" },
                                { key: "leadNotifications", label: "Lead Notifications" },
                                { key: "reviewNotifications", label: "Review Notifications" },
                                { key: "systemNotifications", label: "System Notifications" },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <Label>{item.label}</Label>
                                    <Switch
                                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                                        onCheckedChange={(checked) =>
                                            updateSetting("notifications", item.key, checked)
                                        }
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email */}
                <TabsContent value="email">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>Business email and sender information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Business Email</Label>
                                <Input
                                    value={settings.email.businessEmail}
                                    onChange={(e) => updateSetting("email", "businessEmail", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Sender Name</Label>
                                <Input
                                    value={settings.email.senderName}
                                    onChange={(e) => updateSetting("email", "senderName", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Reply-To</Label>
                                <Input
                                    value={settings.email.replyTo}
                                    onChange={(e) => updateSetting("email", "replyTo", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* WhatsApp */}
                <TabsContent value="whatsapp">
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Settings</CardTitle>
                            <CardDescription>WhatsApp number and preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>WhatsApp Number</Label>
                                <Input
                                    value={settings.whatsapp.whatsappNumber}
                                    onChange={(e) => updateSetting("whatsapp", "whatsappNumber", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Auto Reply</Label>
                                <Switch
                                    checked={settings.whatsapp.autoReply}
                                    onCheckedChange={(checked) => updateSetting("whatsapp", "autoReply", checked)}
                                />
                            </div>
                            <div>
                                <Label>Message Template</Label>
                                <Textarea
                                    value={settings.whatsapp.messageTemplate}
                                    onChange={(e) => updateSetting("whatsapp", "messageTemplate", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics */}
                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics Configuration</CardTitle>
                            <CardDescription>Analytics and tracking settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Analytics Provider</Label>
                                <Input
                                    value={settings.analytics.analyticsConfig}
                                    onChange={(e) => updateSetting("analytics", "analyticsConfig", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Enable Google Analytics</Label>
                                <Switch
                                    checked={settings.analytics.enableGoogleAnalytics}
                                    onCheckedChange={(checked) => updateSetting("analytics", "enableGoogleAnalytics", checked)}
                                />
                            </div>
                            {settings.analytics.enableGoogleAnalytics && (
                                <div>
                                    <Label>Tracking ID</Label>
                                    <Input
                                        value={settings.analytics.trackingId}
                                        onChange={(e) => updateSetting("analytics", "trackingId", e.target.value)}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SEO */}
                <TabsContent value="seo">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global SEO Defaults</CardTitle>
                            <CardDescription>Default SEO settings for pages</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Global SEO Title</Label>
                                <Input
                                    value={settings.seo.globalSeoTitle}
                                    onChange={(e) => updateSetting("seo", "globalSeoTitle", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Global Meta Description</Label>
                                <Textarea
                                    value={settings.seo.globalMetaDescription}
                                    onChange={(e) => updateSetting("seo", "globalMetaDescription", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Enable Sitemap</Label>
                                <Switch
                                    checked={settings.seo.enableSitemap}
                                    onCheckedChange={(checked) => updateSetting("seo", "enableSitemap", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integrations */}
                <TabsContent value="integrations">
                    <Card>
                        <CardHeader>
                            <CardTitle>External Integrations</CardTitle>
                            <CardDescription>Connect with third-party services</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Google Maps API Key</Label>
                                <Input
                                    value={settings.integrations.googleMapsApiKey}
                                    onChange={(e) => updateSetting("integrations", "googleMapsApiKey", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Enable Facebook Pixel</Label>
                                <Switch
                                    checked={settings.integrations.enableFacebookPixel}
                                    onCheckedChange={(checked) => updateSetting("integrations", "enableFacebookPixel", checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Enable Google Ads</Label>
                                <Switch
                                    checked={settings.integrations.enableGoogleAds}
                                    onCheckedChange={(checked) => updateSetting("integrations", "enableGoogleAds", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Preferences</CardTitle>
                            <CardDescription>Session and access settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Two-Factor Authentication</Label>
                                <Switch
                                    checked={settings.security.twoFactorAuth}
                                    onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
                                />
                            </div>
                            <div>
                                <Label>Session Timeout</Label>
                                <Input
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => updateSetting("security", "sessionTimeout", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>IP Whitelist</Label>
                                <Input
                                    value={settings.security.ipWhitelist}
                                    onChange={(e) => updateSetting("security", "ipWhitelist", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Help / Bottom Area */}
                <TabsContent value="help">
                    <Card>
                        <CardHeader>
                            <CardTitle>Help & Support</CardTitle>
                            <CardDescription>Documentation and contact options</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                    <FileText className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-medium">Documentation</p>
                                        <p className="text-sm text-muted-foreground">Browse guides and API docs</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                    <LifeBuoy className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-medium">Contact Support</p>
                                        <p className="text-sm text-muted-foreground">Get help from our team</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                                    <div>
                                        <p className="font-medium">Report a Problem</p>
                                        <p className="text-sm text-muted-foreground">Send us a bug report</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                    <HelpCircle className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-medium">Help Center</p>
                                        <p className="text-sm text-muted-foreground">FAQs and tutorials</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features">
          <FeaturesSettings features={draftFeatures} onToggle={handleFeatureToggle} />
        </TabsContent>
            </Tabs>
        </div>
    );
}