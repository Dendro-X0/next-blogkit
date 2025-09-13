import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins";
import * as schema from "../../../auth-schema";
import { env } from "../../../env";
import { getSiteUrl } from "@/lib/url";
import { db } from "../db";
import { sendPasswordResetEmail, sendVerificationEmail } from "../email/email";

export const authOptions = {
  appName: "Next.js Blog Boilerplate",
  baseURL: getSiteUrl(),
  trustedOrigins: [getSiteUrl()],
  database: drizzleAdapter(db, { schema, provider: "pg" }),
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  user: {
    additionalFields: {
      onboardingComplete: {
        type: "boolean" as const,
        required: false,
        default: false,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders: {
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            scope: ["email", "profile"],
          }
        : undefined,
    github:
      env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            scope: ["user:email"],
          }
        : undefined,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({
      user,
      url,
    }: { user: { email: string; name?: string | null }; url: string }) => {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name || user.email,
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // If the first verification email fails (e.g., SMTP misconfig), try again on next sign-in.
    sendOnSignIn: true,
    // Improve UX once verified.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: { user: { email: string; name: string | null }; url: string }) => {
      await sendVerificationEmail({ email: user.email, url, name: user.name as string });
    },
  },
  plugins: [
    username(),
    twoFactor(),
    nextCookies(), // Must be last plugin for proper cookie handling
  ],
};

export const auth = betterAuth(authOptions);

export type AuthOptions = typeof authOptions;
