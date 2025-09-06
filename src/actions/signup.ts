"use server";

import { auth } from "@/lib/auth/auth";
import { isAuthError } from "@/lib/auth/auth-utils";
import { type SignupInput, SignupSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export type SignupFormState = {
  error?: {
    message?: string;
    fields?: Partial<Record<keyof SignupInput, string[]>>;
  };
  values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  };
};

export async function signupAction(
  prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const name = `${rawFormData.firstName} ${rawFormData.lastName}`.trim();

  const validatedFields = SignupSchema.safeParse({
    ...rawFormData,
    name,
    agreeToTerms: rawFormData.agreeToTerms === "on",
  });

  const formValues = {
    firstName: (rawFormData.firstName as string) || "",
    lastName: (rawFormData.lastName as string) || "",
    email: (rawFormData.email as string) || "",
    password: (rawFormData.password as string) || "",
    confirmPassword: (rawFormData.confirmPassword as string) || "",
    agreeToTerms: rawFormData.agreeToTerms === "on",
  };

  if (!validatedFields.success) {
    return {
      error: {
        fields: validatedFields.error.flatten().fieldErrors,
      },
      values: formValues,
    };
  }

  try {
    const { email, password } = validatedFields.data;
    await auth.api.signUpEmail({ body: { email, password, name, onboardingComplete: false } });
  } catch (error: unknown) {
    if (isAuthError(error)) {
      return {
        error: {
          message: error.body.message,
        },
        values: formValues,
      };
    }
    console.error(error);
    return {
      error: {
        message: "An unexpected error occurred. Please try again.",
      },
      values: formValues,
    };
  }

  redirect("/auth/login?message=Account created successfully. Please sign in.");
}
