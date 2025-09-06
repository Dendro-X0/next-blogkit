"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/auth-client";
import { FaGithub, FaGoogle } from "react-icons/fa";

interface SocialLoginProps {
  isLoading?: boolean;
  showSeparator?: boolean;
  separatorText?: string;
}

export function SocialLogin({
  isLoading = false,
  showSeparator = true,
  separatorText = "Or continue with email",
}: SocialLoginProps) {
  const handleSocialLogin = (provider: "github" | "google") => {
    authClient.signIn.social({ provider });
  };

  return (
    <>
      {showSeparator && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{separatorText}</span>
          </div>
        </div>
      )}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
        >
          <FaGoogle className="h-4 w-4 mr-2" />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
        >
          <FaGithub className="h-4 w-4 mr-2" />
          Continue with GitHub
        </Button>
      </div>
    </>
  );
}
