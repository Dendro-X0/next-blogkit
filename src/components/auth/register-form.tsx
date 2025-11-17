"use client";

import type { SignupFormState } from "@/actions/signup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { Mail } from "lucide-react";
import Link from "next/link";
import { type ReactElement, useState } from "react";
import { useFormStatus } from "react-dom";
import { PasswordInput } from "./password-input";

interface RegisterFormProps {
  formState: SignupFormState;
}

function RegisterButton(): ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      Create Account
    </Button>
  );
}

/**
 * Registration form fields. Parent page provides the form action and state.
 */
export function RegisterForm({ formState }: RegisterFormProps): ReactElement {
  const [password, setPassword] = useState<string>(formState.values.password ?? "");
  return (
    <div className="space-y-4">
      {/* Name fields removed per UX simplification. Users can set names in profile. */}

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          placeholder="johndoe"
          autoComplete="username"
          required
          defaultValue={formState.values.username}
        />
        {formState.error?.fields?.username && (
          <p className="text-sm text-destructive">{formState.error.fields.username.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            className="pl-10"
            autoComplete="email"
            required
            defaultValue={formState.values.email}
          />
        </div>
        {formState.error?.fields?.email && (
          <p className="text-sm text-destructive">{formState.error.fields.email.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter a strong password"
          autoComplete="new-password"
          required
          defaultValue={formState.values.password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
        />
        <PasswordStrengthIndicator password={password} />
        {formState.error?.fields?.password && (
          <p className="text-sm text-destructive">{formState.error.fields.password.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          defaultValue={formState.values.confirmPassword}
        />
        {formState.error?.fields?.confirmPassword && (
          <p className="text-sm text-destructive">
            {formState.error.fields.confirmPassword.join(", ")}
          </p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="agreeToTerms"
          name="agreeToTerms"
          defaultChecked={formState.values.agreeToTerms}
        />
        <Label htmlFor="agreeToTerms" className="text-sm font-normal">
          I agree to the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </Label>
      </div>
      {formState.error?.fields?.agreeToTerms && (
        <p className="text-sm text-destructive">{formState.error.fields.agreeToTerms.join(", ")}</p>
      )}

      {formState.error?.message && (
        <p className="text-sm text-destructive">{formState.error.message}</p>
      )}

      <RegisterButton />
    </div>
  );
}
