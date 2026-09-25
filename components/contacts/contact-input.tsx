"use client";

import {
  useEffect,
  useState,
  type InputHTMLAttributes,
} from "react";

type ContactMode = "phone" | "email";

type ContactInputProps =
  InputHTMLAttributes<HTMLInputElement> & {
    kind: ContactMode;
  };

export function ContactInput({
  kind,
  ...props
}: ContactInputProps) {
  const [mode, setMode] = useState<ContactMode | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadContactMode() {
      try {
        const response = await fetch("/api/contact-mode", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Contact settings unavailable.");
        }

        const data = await response.json();

        if (
          data.contact_mode !== "phone" &&
          data.contact_mode !== "email"
        ) {
          throw new Error("Invalid contact mode.");
        }

        setMode(data.contact_mode);
      } catch {
        if (!controller.signal.aborted) {
          setFailed(true);
        }
      }
    }

    void loadContactMode();

    return () => controller.abort();
  }, []);

  return (
    <div>
      <input
        {...props}
        type={kind === "phone" ? "tel" : "email"}
        required={mode === kind}
        maxLength={kind === "phone" ? 30 : 254}
        className={
          props.className ||
          "h-10 w-full rounded-md border bg-background px-3 text-sm"
        }
      />

      <p
        aria-live="polite"
        className="mt-1 text-xs text-muted-foreground"
      >
        {failed
          ? "Could not load settings. Refresh this page."
          : !mode
            ? "Loading contact settings…"
            : mode === kind
              ? "Required for this business"
              : "Optional"}
      </p>
    </div>
  );
}
