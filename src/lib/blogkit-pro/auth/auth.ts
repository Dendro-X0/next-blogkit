import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins";
import * as schema from "../db/auth-schema";
import { db } from "@/lib/db";

const getSiteUrl = (): string => {
  const fromEnv: string | undefined = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
};

const getBetterAuthSecret = (): string => {
  const secret: string | undefined = process.env.BETTER_AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_SECRET is required in production");
  return "dev-secret-change-me";
};

const authOptions = {
  appName: "blogkit-pro",
  baseURL: getSiteUrl(),
  trustedOrigins: [getSiteUrl()],
  secret: getBetterAuthSecret(),
  database: drizzleAdapter(db, { schema, provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [username(), twoFactor(), nextCookies()],
};

export const auth = betterAuth(authOptions);
export type AuthOptions = typeof authOptions;
