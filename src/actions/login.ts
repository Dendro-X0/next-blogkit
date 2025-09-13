"use server";

import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { LoginSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export type LoginFormState = {
  success?: boolean;
  error?: {
    message?: string;
    fields?: {
      email?: string[];
      password?: string[];
    };
  };
};

export async function loginAction(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  try {
    const credentials = Object.fromEntries(formData.entries());
    const validatedFields = LoginSchema.safeParse(credentials);

    if (!validatedFields.success) {
      return {
        error: {
          fields: validatedFields.error.flatten().fieldErrors,
        },
      };
    }

    const { email, password } = validatedFields.data;

    await auth.api.signInEmail({ body: { email, password } });
    redirect("/profile?message=Logged%20in%20successfully");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (isAuthError(error)) {
      const base = error.body.message || "Unable to sign in.";
      return {
        error: {
          // If the account is unverified, Better Auth (with sendOnSignIn enabled) will
          // automatically resend a verification email when the user attempts to sign in.
          // Provide a helpful unified message so users know what to expect.
          message: `${base} If your email is not verified yet, a new verification link has been sent. Please check your inbox (and spam folder).`,
        },
      };
    }
    console.error(error);
    return {
      error: {
        message: "An unexpected error occurred. Please try again.",
      },
    };
  }
}
