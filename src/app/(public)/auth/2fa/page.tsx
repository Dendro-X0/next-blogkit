"use client";

import { verifyTwoFactorCode } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { TwoFactorForm, type TwoFactorFormData } from "@/components/auth/two-factor-form";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useTransition } from "react";
import { toast } from "sonner";

function TwoFactorPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [isPending, startTransition] = useTransition();

  if (!userId) {
    router.push("/auth/login");
    // Render nothing while redirecting
    return null;
  }

  const handleTwoFactorSubmit = async (data: TwoFactorFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("code", data.code);
      formData.append("userId", userId);
      const result = await verifyTwoFactorCode({ error: undefined, success: undefined }, formData);
      if (result.error) {
        toast.error("Verification failed", {
          description: result.error,
        });
      } else if (result.success) {
        toast.success("Verification successful!", {
          description: "You have been successfully logged in.",
        });
        router.push("/");
      }
    });
  };

  return (
    <AuthCard
      title="Two-Factor Authentication"
      description="Enter the 6-digit code from your authenticator app"
      icon={<Shield className="h-6 w-6 text-primary" />}
    >
      <TwoFactorForm onSubmit={handleTwoFactorSubmit} isLoading={isPending} />

      <div className="text-center">
        <Link href="/auth/login" className="text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TwoFactorPageComponent />
    </Suspense>
  );
}
