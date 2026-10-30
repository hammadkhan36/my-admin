"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-browser";

export function SubscriptionLogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <Button type="button" variant="outline" className="w-full h-9" onClick={logout}>
      Log out
    </Button>
  );
}
