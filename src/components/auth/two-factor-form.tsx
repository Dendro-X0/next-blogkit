"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface TwoFactorFormData {
  code: string;
}

interface TwoFactorFormProps {
  onSubmit: (data: TwoFactorFormData) => Promise<void>;
  onResendCode?: () => Promise<void>;
  isLoading?: boolean;
  resendCooldown?: number;
}

/**
 * TwoFactorForm collects and submits a 6-digit OTP code with mobile-friendly inputs and a resend action.
 */
export function TwoFactorForm({
  onSubmit,
  onResendCode,
  isLoading = false,
  resendCooldown = 0,
}: TwoFactorFormProps): React.ReactElement {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== "") && newCode.join("").length === 6) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }

    setCode(newCode);

    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleSubmit = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");
    await onSubmit({ code: codeToVerify });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-4" autoComplete="one-time-code">
        <fieldset aria-label="Two-factor authentication code">
          <legend className="sr-only">Enter 6-digit verification code</legend>
          <div className="flex justify-center gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`Digit ${index + 1}`}
                className="w-10 h-12 sm:w-12 text-center text-base sm:text-lg font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>
        </fieldset>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || code.some((digit) => digit === "")}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>

      {onResendCode && (
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Didn&apos;t receive a code?</p>
          <Button
            variant="ghost"
            onClick={onResendCode}
            disabled={resendCooldown > 0}
            className="text-primary hover:underline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
          </Button>
        </div>
      )}
    </div>
  );
}
