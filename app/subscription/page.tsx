import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { requireProfile } from "@/lib/auth/server";
import { getSubscriptionStatus } from "@/lib/subscription/server";
import { RENEWAL_ROLES } from "@/lib/subscription/types";
import { RenewSubscriptionForm } from "@/components/renew-subscription-form";
import { SubscriptionLogoutButton } from "@/components/subscription-logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SubscriptionPage() {
  const profile = await requireProfile({ allowExpiredSubscription: true });
  const status = await getSubscriptionStatus();

  if (status.state !== "expired") {
    redirect("/dashboard");
  }

  const canRenew = (RENEWAL_ROLES as readonly string[]).includes(profile.role);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <CardTitle className="text-2xl">Subscription Expired</CardTitle>
          <CardDescription>
            {canRenew
              ? "Your subscription has expired. Enter the renewal code to restore access."
              : "The subscription has expired. Please contact the business owner to renew it."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canRenew ? (
            <RenewSubscriptionForm redirectOnSuccess="/dashboard" />
          ) : null}
          <SubscriptionLogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
