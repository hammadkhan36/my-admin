
// Ye reusable loading button hai. Staff, permissions, superadmin, settings sab mein use ho sakta hai.

"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentProps, ReactNode } from "react";

type PendingSubmitButtonProps = Omit<ComponentProps<typeof Button>, "children" | "type"> & {
  children: ReactNode;
  pendingText?: string;
};

export function PendingSubmitButton({
  children,
  variant = "default",
  pendingText,
  disabled,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" variant={variant} disabled={pending || disabled} aria-busy={pending}>
      {pending && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}
