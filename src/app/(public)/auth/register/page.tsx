"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { type SignupFormState, signupAction } from "@/actions/signup";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialLogin } from "@/components/auth/social-login";

const initialState: SignupFormState = {
  values: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  },
};

export default function RegisterPage() {
  const [formState, action] = useActionState(signupAction, initialState);

  useEffect(() => {
    if (formState.error?.message) {
      toast.error(formState.error.message);
    }
  }, [formState.error?.message]);

  return (
    <AuthCard title="Create Account" description="Join our community and start blogging today">
      <form action={action} className="space-y-4">
        <RegisterForm formState={formState} />
      </form>

      <SocialLogin />

      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
