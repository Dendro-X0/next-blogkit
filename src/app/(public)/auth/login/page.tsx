"use client";

import { loginAction } from "@/actions/login";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SocialLogin } from "@/components/auth/social-login";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [formState, action] = useActionState(loginAction, {
    error: undefined,
  });

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      toast.success("Success", {
        description: message,
      });
    }
  }, [searchParams]);

  return (
    <AuthCard title="Welcome Back" description="Sign in to your account to continue">
      <form action={action}>
        <LoginForm formState={formState} />
      </form>
      <SocialLogin separatorText="Or sign in with your email" />
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href="/auth/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
}
