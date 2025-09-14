import { z } from "zod";

export const LoginSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: "Please enter your email or username." })
    .max(100, { message: "Identifier is too long." })
    .refine(
      (val) => {
        const isEmail = /.+@.+\..+/.test(val);
        const isUsername = /^[a-zA-Z0-9._-]{3,30}$/.test(val);
        return isEmail || isUsername;
      },
      { message: "Enter a valid email or username." },
    ),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export const SignupSchema = z
  .object({
    name: z.string().min(3, {
      message: "Name must be at least 3 characters long.",
    }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(30, { message: "Username must be at most 30 characters long." })
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message: "Username can only contain letters, numbers, dots, underscores, and hyphens.",
      }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof SignupSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
    token: z.string().min(1, "Reset token is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
