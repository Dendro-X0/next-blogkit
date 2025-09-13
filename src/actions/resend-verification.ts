"use server";

import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { z } from "zod";

export type ResendVerificationFormState = {
  success?: boolean;
  message?: string;
  error?: string;
};

const EmailSchema = z.object({
  email: z.string().email(),
});

/**
 * Resend a verification email for an unverified account.
 * Uses Better Auth API and respects callbackURL defaults.
 */
export async function resendVerificationAction(
  _prev: ResendVerificationFormState,
  formData: FormData,
): Promise<ResendVerificationFormState> {
  const parsed = EmailSchema.safeParse({ email: String(formData.get("resend_email") ?? "") });
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }
  const { email } = parsed.data;

  try {
    await auth.api.sendVerificationEmail({ body: { email, callbackURL: "/" } });
    return {
      success: true,
      message: "Verification email sent. Please check your inbox (and spam folder).",
    };
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return { error: error.body.message };
    }
    console.error(error);
    return { error: "Failed to send verification email. Please try again later." };
  }
}
