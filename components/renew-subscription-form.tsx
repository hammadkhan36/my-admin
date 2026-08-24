"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/components/subscription-provider";
import { toast } from "sonner";

export function RenewSubscriptionForm() {
  const { renewWithCode } = useSubscription();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter renewal code");
      return;
    }
    const success = renewWithCode(code.trim());
    if (success) {
      toast.success("Subscription renewed successfully!");
      setCode("");
    } else {
      toast.error("Invalid renewal code");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="renewal-code">Renewal Code</Label>
        <Input
          id="renewal-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code provided by support"
          className="h-9"
        />
      </div>
      <Button type="submit" className="w-full h-9">
        Renew Subscription
      </Button>
    </form>
  );
}