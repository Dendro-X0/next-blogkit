import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
    ADMIN_EMAILS: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_AUDIENCE_ID: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),
    MAIL_PROVIDER: z.enum(["resend", "smtp"]).default("resend"),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.coerce.number().int().positive().optional(),
    ),
    SMTP_SECURE: z.preprocess((v) => v === "true" || v === "1", z.boolean()).default(false),
    SMTP_USER: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().min(1).optional(),
    ),
    SMTP_PASS: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().min(1).optional(),
    ),

    // S3 Storage Configuration
    S3_REGION: z.string().min(1).optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_BUCKET_NAME: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_PUBLIC_URL: z.string().url().optional(),
    DISABLE_AUTH_GUARD: z.preprocess((v) => v === "true" || v === "1", z.boolean()).default(false),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_S3_PUBLIC_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
    EMAIL_FROM: process.env.EMAIL_FROM,
    MAIL_PROVIDER: process.env.MAIL_PROVIDER,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,

    // S3 Storage
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
    NEXT_PUBLIC_S3_PUBLIC_URL: process.env.NEXT_PUBLIC_S3_PUBLIC_URL,
    DISABLE_AUTH_GUARD: process.env.DISABLE_AUTH_GUARD,
  },
});

// Production-only verification for critical environment variables
if (process.env.NODE_ENV === "production") {
  // Hard requirements for a working build/runtime
  const baseRequired = ["DATABASE_URL"] as const;
  const missingHard: string[] = [];
  for (const key of baseRequired) {
    if (!process.env[key]) missingHard.push(key);
  }
  if (missingHard.length) {
    throw new Error(
      `Missing required environment variables in production: ${missingHard.join(", ")}`,
    );
  }

  // Soft checks: warn if auth/email are not configured; app will degrade gracefully
  if (!process.env.BETTER_AUTH_SECRET) {
    console.warn(
      "[env] BETTER_AUTH_SECRET is not set. Authentication features may be limited in production.",
    );
  }
  const provider = process.env.MAIL_PROVIDER ?? "resend";
  if (provider === "resend") {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      console.warn(
        "[env] Resend is selected but RESEND_API_KEY and/or EMAIL_FROM are missing. Email sending will be disabled.",
      );
    }
  } else if (provider === "smtp") {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.EMAIL_FROM) {
      console.warn(
        "[env] SMTP is selected but SMTP_HOST/SMTP_PORT/EMAIL_FROM are missing. Email sending will be disabled.",
      );
    }
  }
}
