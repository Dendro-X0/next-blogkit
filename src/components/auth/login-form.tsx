"use client";

import type { LoginFormState } from "@/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useFormStatus } from "react-dom";
import { PasswordInput } from "./password-input";

interface LoginFormProps {
  formState: LoginFormState;
}

function LoginButton(): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

/**
 * Login form fields and submit button. Must be wrapped by an outer form that provides `action`.
 */
export function LoginForm({ formState }: LoginFormProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">Email or Username</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="email@example.com or johndoe"
            className="pl-10"
            autoComplete="username"
            required
          />
        </div>
        {formState.error?.fields?.identifier && (
          <p className="text-sm text-destructive">{formState.error.fields.identifier.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <PasswordInput
            id="password"
            name="password"
            placeholder="Enter your password"
            className="pl-10"
            autoComplete="current-password"
            required
          />
        </div>
        {formState.error?.fields?.password && (
          <p className="text-sm text-destructive">{formState.error.fields.password.join(", ")}</p>
        )}
      </div>

      <div className="text-right">
        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      {formState.error?.message && (
        <p className="text-sm text-destructive">{formState.error.message}</p>
      )}

      <LoginButton />
    </div>
  );
}
