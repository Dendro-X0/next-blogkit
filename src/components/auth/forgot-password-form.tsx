"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";

export interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void> | void;
  isLoading?: boolean;
  initialEmail?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  isLoading = false,
  initialEmail = "",
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 ">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Sending reset link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  );
}
