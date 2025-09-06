"use client";

import { resetPassword } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { NewPasswordForm, type NewPasswordFormData } from "@/components/auth/new-password-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function NewPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleNewPassword = (data: NewPasswordFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      if (token) {
        formData.append("token", token);
      }
      const result = await resetPassword({ error: undefined, message: undefined }, formData);
      if (result.message) {
        toast.success("Password updated!", {
          description: result.message,
        });
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
        title="Password Updated!"
        description="Your password has been successfully updated"
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            You can now log in to your account using your new password.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create New Password"
      description="Enter your new password below"
      icon={<Lock className="h-6 w-6 text-primary" />}
    >
      <NewPasswordForm onSubmit={handleNewPassword} isLoading={isPending} />
      <div className="text-center mt-4">
        <Link href="/auth/login" className="text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
}
