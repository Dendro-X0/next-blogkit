"use server";

import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { ResetPasswordSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export type FormState = {
  error?: { message: string };
  message?: string;
};
export async function resetPasswordAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = ResetPasswordSchema.safeParse(data);

  if (!validatedFields.success) {
    const { formErrors, fieldErrors } = validatedFields.error.flatten();
    const allErrors = [...formErrors, ...Object.values(fieldErrors).flat()];
    const errorMessages = allErrors.join(", ");
    return { error: { message: errorMessages || "Invalid fields provided." } };
  }

  const { token, password } = validatedFields.data;

  try {
    await auth.api.resetPassword({ body: { token, newPassword: password } });
    redirect("/auth/login?message=Password has been reset successfully.");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Reset password error:", error);

    if (isAuthError(error)) {
      return { error: { message: error.body.message } };
    }

    return { error: { message: "An error occurred. Please try again." } };
  }
}
