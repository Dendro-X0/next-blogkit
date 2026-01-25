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
      <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 delay-100">
        <Button
          variant="outline"
          className="w-full bg-background/50 hover:bg-background transition-all border-border/50"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
          aria-label="Continue with Google"
        >
          <FaGoogle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="w-full bg-background/50 hover:bg-background transition-all border-border/50"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
          aria-label="Continue with GitHub"
        >
          <FaGithub className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
