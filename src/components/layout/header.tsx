import { headers } from "next/headers";
import type { ReactElement } from "react";
import { getSessionWithRoles } from "@/lib/auth/session";
import { HeaderClient } from "./header-client";
import { env } from "~/env";

export async function Header(): Promise<ReactElement> {
  const hdrs = new Headers(await headers());
  const { user } = await getSessionWithRoles(hdrs);
  const allowlist: string[] = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const email = user?.email?.toLowerCase() ?? null;
  const isAllowlisted = allowlist.length > 0 && !!email && allowlist.includes(email);
  const isAdmin = Boolean(user && user.roles.includes("admin")) || isAllowlisted;
  return <HeaderClient isAdmin={isAdmin} />;
}
