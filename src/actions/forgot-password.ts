"use server";

import { auth } from "@/lib/auth/auth";
import { ForgotPasswordSchema } from "@/lib/validations/auth";

export type FormState = {
  error?: { message: string };
  message?: string;
};

export async function forgotPasswordAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = ForgotPasswordSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: { message: "Invalid email provided." } };
  }

  const { email } = validatedFields.data;

  try {
    await auth.api.forgetPassword({ body: { email } });
  } catch (error: unknown) {
    // Log the error for debugging, but don't expose it to the client to prevent email enumeration.
    console.error("Forgot password error:", error);
  }

  // Always return the same message to prevent email enumeration.
  return {
    message: "If an account with that email exists, a password reset link has been sent.",
  };
}
