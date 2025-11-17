"use client";

import type { ResendVerificationFormState } from "@/actions/resend-verification";
import { resendVerificationAction } from "@/actions/resend-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Renders a compact form to resend an email verification link.
 * Intended to be displayed on the login page to help users recover from
 * missed or failed initial verification emails.
 */
export function ResendVerificationForm(): React.ReactElement {
  const [formState, action] = useActionState(
    resendVerificationAction,
    {} as ResendVerificationFormState,
  );
  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-sm font-medium">Didn&apos;t receive the verification email?</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Enter your email address and we&apos;ll send a new verification link.
      </p>
      <form action={action} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="resend_email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="resend_email"
              name="resend_email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              autoComplete="username"
              required
            />
          </div>
        </div>
        {formState?.error && (
          <p className="text-xs text-destructive" role="alert">
            {formState.error}
          </p>
        )}
        {formState?.message && (
          <p className="text-xs text-emerald-600" aria-live="polite">
            {formState.message}
          </p>
        )}
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton(): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} aria-label="Resend verification email">
      {pending ? "Sending..." : "Resend verification"}
    </Button>
  );
}
