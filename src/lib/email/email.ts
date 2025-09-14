import "server-only";
import { render } from "@react-email/render";
import nodemailer, { type Transporter } from "nodemailer";
import * as React from "react";
import { Resend } from "resend";

import { PasswordResetEmail } from "@/emails/password-reset-email";
import { VerificationEmail } from "@/emails/verification-email";
import { env } from "~/env";
import { getSiteUrl } from "@/lib/url";

function getResend(): Resend | null {
  try {
    if (env.MAIL_PROVIDER === "smtp") return null;
    if (!env.RESEND_API_KEY) return null;
    return new Resend(env.RESEND_API_KEY);
  } catch {
    return null;
  }
}

/**
 * Normalize a Better Auth action URL to use the origin (scheme + host + port)
 * from NEXT_PUBLIC_APP_URL. Falls back to the original URL if parsing fails.
 */
function normalizeUrl(toUrl: string): string {
  try {
    const base: URL = new URL(getSiteUrl());
    const u: URL = new URL(toUrl);
    u.protocol = base.protocol;
    u.host = base.host;
    return u.toString();
  } catch {
    return toUrl;
  }
}

function getSmtpTransporter(): Transporter {
  const host: string = env.SMTP_HOST ?? "127.0.0.1";
  const port: number = env.SMTP_PORT ?? 1025;
  const secure: boolean = env.SMTP_SECURE ?? false;
  const user: string | undefined = env.SMTP_USER;
  const pass: string | undefined = env.SMTP_PASS;
  const hasAuth: boolean = Boolean(user && pass);
  // Detect local MailHog by default host/port and force plain SMTP
  const isMailhog: boolean = (host === "127.0.0.1" || host === "localhost") && port === 1025;
  const finalSecure: boolean = isMailhog ? false : secure;
  const finalIgnoreTLS: boolean = isMailhog ? true : !finalSecure;

  // Helpful debug to confirm runtime configuration (visible in server logs)
  // Note: does not log credentials
  console.info("[email] SMTP config", {
    host,
    port,
    secure: finalSecure,
    ignoreTLS: finalIgnoreTLS,
    hasAuth,
  });

  const transporter: Transporter = nodemailer.createTransport({
    host,
    port,
    secure: finalSecure,
    // MailHog does not support TLS; prevent STARTTLS/SSL attempts
    ignoreTLS: finalIgnoreTLS,
    requireTLS: false,
    tls: { rejectUnauthorized: false },
    auth: hasAuth ? { user: user as string, pass: pass as string } : undefined,
    logger: true,
  });
  return transporter;
}

interface EmailParams {
  email: string;
  name: string;
  url: string;
}

/**
 * Send password reset email via configured provider (Resend or SMTP).
 */
export async function sendPasswordResetEmail({ email, name, url }: EmailParams): Promise<void> {
  try {
    if (!env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM environment variable is not set");
    }
    const subject: string = "Reset your password";
    const normalizedUrl: string = normalizeUrl(url);
    const element: React.ReactElement = React.createElement(PasswordResetEmail, {
      name,
      url: normalizedUrl,
    });
    if (env.NODE_ENV !== "production") {
      console.info("[email] (dev) Password reset link:", normalizedUrl);
    }
    if (env.MAIL_PROVIDER === "smtp") {
      const transporter: Transporter = getSmtpTransporter();
      const html: string = await render(element);
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject,
        html,
        text: `${name}, reset your password: ${normalizedUrl}`,
      });
    } else {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: env.EMAIL_FROM as string,
          to: email,
          subject,
          react: element,
        });
      } else {
        // Fallback to SMTP (useful in development with MailHog)
        const transporter: Transporter = getSmtpTransporter();
        const html: string = await render(element);
        await transporter.sendMail({
          from: env.EMAIL_FROM,
          to: email,
          subject,
          html,
          text: `${name}, reset your password: ${normalizedUrl}`,
        });
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send password reset email");
  }
}

/**
 * Send email verification via configured provider (Resend or SMTP).
 */
export async function sendVerificationEmail({ email, name, url }: EmailParams): Promise<void> {
  try {
    if (!env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM environment variable is not set");
    }
    const subject: string = "Verify your email address";
    const normalizedUrl: string = normalizeUrl(url);
    const element: React.ReactElement = React.createElement(VerificationEmail, {
      name,
      url: normalizedUrl,
    });
    if (env.NODE_ENV !== "production") {
      console.info("[email] (dev) Verification link:", normalizedUrl);
    }
    if (env.MAIL_PROVIDER === "smtp") {
      const transporter: Transporter = getSmtpTransporter();
      const html: string = await render(element);
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject,
        html,
        text: `${name}, verify your email: ${normalizedUrl}`,
      });
    } else {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: env.EMAIL_FROM as string,
          to: email,
          subject,
          react: element,
        });
      } else {
        // Fallback to SMTP (useful in development with MailHog). Do not throw to avoid signup deadlocks.
        try {
          const transporter: Transporter = getSmtpTransporter();
          const html: string = await render(element);
          await transporter.sendMail({
            from: env.EMAIL_FROM,
            to: email,
            subject,
            html,
            text: `${name}, verify your email: ${normalizedUrl}`,
          });
        } catch (e) {
          console.error("[email] Fallback SMTP verification send failed:", e);
          // As a last resort in development, the link is already logged above.
          // Avoid throwing here to prevent a sign-up hard failure; follow-up attempts can resend.
        }
      }
    }
  } catch (error) {
    console.error(error);
    // Avoid aborting sign-up flows; email can be resent on sign-in due to emailVerification.sendOnSignIn.
    // Still surface the error in logs for visibility.
  }
}
