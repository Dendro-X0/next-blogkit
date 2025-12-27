"use server";

import { auth } from "@/lib/auth/auth";
import { ForgotPasswordSchema } from "@/lib/validations/auth";

export type FormState = {
  error?: { message: string };
  message?: string;
};

export async function forgotPasswordAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = ForgotPasswordSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: { message: "Invalid email provided." } };
  }

  const { email } = validatedFields.data;

  try {
    const redirectTo: string = new URL("/auth/new-password", "http://localhost:3000").toString();
    await auth.api.requestPasswordReset({ body: { email, redirectTo } });
  } catch (error: unknown) {
    // Log the error for debugging, but don't expose it to the client to prevent email enumeration.
    console.error("Forgot password error:", error);
  }

  // Always return the same message to prevent email enumeration.
  return {
    message: "If an account with that email exists, a password reset link has been sent.",
  };
}
