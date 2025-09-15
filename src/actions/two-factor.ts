"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";

export type TwoFactorFormState = {
  error?: string;
  success?: string;
  totpUri?: string;
  backupCodes?: readonly string[];
};

// Better Auth two-factor plugin endpoints are available at runtime when the
// twoFactor() plugin is configured, but the generated API type may not include
// them. Define a typed adapter to satisfy TypeScript without using `any`.
interface TwoFactorApi {
  enable(args: { headers: Headers; body: { password: string } }): Promise<{
    totpURI?: string;
    backupCodes?: string[];
  }>;
  verifyOtp(args: {
    headers: Headers;
    body: { code: string; trustDevice?: boolean };
  }): Promise<void>;
  disable(args: { headers: Headers; body: { password: string } }): Promise<void>;
}

function getTwoFactorApi(api: unknown): TwoFactorApi {
  return (api as { twoFactor: TwoFactorApi }).twoFactor;
}

/**
 * Enable Two-Factor Authentication: returns a TOTP URI and backup codes.
 * Requires the user's password in formData("password").
 */
export async function generateTwoFactorSecret(
  _prevState?: TwoFactorFormState,
  formData?: FormData,
): Promise<TwoFactorFormState> {
  const password = formData?.get("password") as string;
  if (!password) {
    return { error: "Password is required to enable 2FA." };
  }
  try {
    const res = await getTwoFactorApi(auth.api).enable({
      headers: new Headers(await headers()),
      body: { password },
    });
    return {
      totpUri: (res as { totpURI?: string }).totpURI ?? undefined,
      backupCodes: (res as { backupCodes?: string[] }).backupCodes,
    };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message };
    }
    console.error("Generate 2FA secret error:", error);
    return { error: "Failed to enable 2FA. Please try again." };
  }
}

export async function verifyTwoFactorCode(
  _prevState?: TwoFactorFormState,
  formData?: FormData,
): Promise<TwoFactorFormState> {
  const code = formData?.get("code") as string;

  try {
    if (!code || !/^[0-9]{6}$/.test(code)) {
      return { error: "Invalid 2FA code. Please enter a 6-digit code." };
    }
    await getTwoFactorApi(auth.api).verifyOtp({
      headers: new Headers(await headers()),
      body: { code, trustDevice: true },
    });
    return { success: "Two-Factor Authentication verified successfully." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message };
    }
    console.error("Verify 2FA error:", error);
    return { error: "Failed to verify 2FA code. Please try again." };
  }
}

export async function enableTwoFactor(
  _prevState?: TwoFactorFormState,
  formData?: FormData,
): Promise<TwoFactorFormState> {
  const code = formData?.get("code") as string;

  try {
    if (!code || !/^[0-9]{6}$/.test(code)) {
      return { error: "Invalid 2FA code. Please enter a 6-digit code." };
    }
    await getTwoFactorApi(auth.api).verifyOtp({
      headers: new Headers(await headers()),
      body: { code, trustDevice: true },
    });
    return { success: "Two-Factor Authentication has been enabled." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message };
    }
    console.error("Enable 2FA error:", error);
    return { error: "Failed to enable 2FA. Please try again." };
  }
}

export async function disableTwoFactor(
  _prevState?: TwoFactorFormState,
  formData?: FormData,
): Promise<TwoFactorFormState> {
  const password = formData?.get("password") as string;
  if (!password) {
    return { error: "Password is required to disable 2FA." };
  }
  try {
    await getTwoFactorApi(auth.api).disable({
      headers: new Headers(await headers()),
      body: { password },
    });
    return { success: "Two-Factor Authentication has been disabled." };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message };
    }
    console.error("Disable 2FA error:", error);
    return { error: "Failed to disable 2FA. Please try again." };
  }
}
