"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { PasswordInput } from "./password-input";
import { PasswordStrength } from "./password-strength";

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface NewPasswordFormProps {
  onSubmit: (data: NewPasswordFormData) => Promise<void> | void;
  isLoading?: boolean;
  token?: string;
}

export function NewPasswordForm({ onSubmit, isLoading = false }: NewPasswordFormProps) {
  const [formData, setFormData] = useState<NewPasswordFormData>({
    password: "",
    confirmPassword: "",
  });

  const passwordsMatch =
    formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const handleInputChange = (field: keyof NewPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    await onSubmit(formData);
  };

  const isFormValid = formData.password.length >= 8 && passwordsMatch;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <PasswordInput
            id="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Create a strong password"
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
        <PasswordStrength password={formData.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <PasswordInput
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            placeholder="Confirm your new password"
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
        {formData.confirmPassword && (
          <div className="flex items-center gap-2 text-xs">
            {passwordsMatch ? (
              <span className="text-success">&#10003; Passwords match</span>
            ) : (
              <span className="text-destructive">&#10007; Passwords don&apos;t match</span>
            )}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Updating password...
          </>
        ) : (
          "Update Password"
        )}
      </Button>
    </form>
  );
}
