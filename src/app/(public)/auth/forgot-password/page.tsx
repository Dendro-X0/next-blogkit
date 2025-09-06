"use client";

import { sendPasswordResetLink } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import {
  ForgotPasswordForm,
  type ForgotPasswordFormData,
} from "@/components/auth/forgot-password-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleForgotPassword = (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      const result = await sendPasswordResetLink(
        { error: undefined, message: undefined },
        formData,
      );
      if (result.message) {
        toast.success("Reset link sent!", {
          description: result.message,
        });
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
      } else if (result.error?.message) {
        toast.error("Error", {
          description: result.error.message,
        });
      }
    });
  };

  if (isSubmitted) {
    return (
      <AuthCard
        title="Check Your Email"
        description=""
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>. Click the
            link in the email to reset your password.
          </p>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:underline"
              >
                try again
              </button>
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Demo:</strong> In a real app, you&apos;d check your email. For this demo,
                use this link:{" "}
                <Link
                  href="/auth/new-password?token=demo-reset-token-123456"
                  className="text-primary hover:underline"
                >
                  Reset Password
                </Link>
              </p>
            </div>

            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      description="Enter your email address and we&apos;ll send you a link to reset your password"
    >
      <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isPending} />

      <div className="text-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
}
