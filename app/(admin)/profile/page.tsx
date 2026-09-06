


import { Mail, ShieldCheck, User } from "lucide-react";
import { requireProfile } from "@/lib/auth/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const profile = await requireProfile();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account information and dashboard access role.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{profile.full_name || "Not set"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {profile.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={profile.is_active ? "default" : "destructive"}>
                {profile.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Role
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <Badge className="capitalize">{profile.role}</Badge>

            <p className="text-sm text-muted-foreground">
              Your role controls which dashboard modules and actions you can access.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Rules</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Password changes are managed by owner/admin from Staff page.</p>
            <p>Permission access is managed from Roles & Permissions page.</p>
            <p>Superadmin and owner accounts are created manually in Supabase.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}