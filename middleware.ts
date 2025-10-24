import { auth } from "@/lib/auth/auth";
import { getUserRoles } from "@/lib/rbac/queries";
import {
  DEFAULT_LOGIN_REDIRECT,
  Routes,
  protectedRoutes,
  routesNotAllowedByLoggedInUsers,
} from "@/routes";
import { env } from "~/env";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const t0: number = Date.now();
  const { nextUrl } = req;
  const session = await auth.api.getSession({ headers: req.headers });
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;
  const isAdminPath: boolean = pathname.startsWith("/admin");
  const isAccountPath: boolean = pathname.startsWith("/account");
  const allowlist: readonly string[] = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (isLoggedIn) {
    const isNotAllowedRoute = routesNotAllowedByLoggedInUsers.some((route: string) =>
      new RegExp(`^${route}$`).test(pathname),
    );
    if (isNotAllowedRoute) {
      const res = NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
      return res;
    }
    // Admin access control
    if (isAdminPath) {
      // If allowlist is configured, honor it first for compatibility.
      if (allowlist.length > 0) {
        const email = session.user.email?.toLowerCase();
        if (!email || !allowlist.includes(email)) {
          const res = NextResponse.redirect(new URL(Routes.Login, nextUrl));
          res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
          return res;
        }
      } else {
        // Otherwise require the 'admin' role.
        const roles = await getUserRoles(session.user.id);
        if (!roles.includes("admin")) {
          const res = NextResponse.redirect(new URL(Routes.Login, nextUrl));
          res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
          return res;
        }
      }
    }
  }
  const isProtectedRoute = protectedRoutes.some((route: string) =>
    new RegExp(`^${route}$`).test(pathname),
  );
  if (!isLoggedIn && (isProtectedRoute || isAccountPath || isAdminPath)) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    const res = NextResponse.redirect(
      new URL(`${Routes.Login}?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
    res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
    return res;
  }
  const res = NextResponse.next();
  res.headers.set("Server-Timing", `mw;desc=auth;dur=${Date.now() - t0}`);
  return res;
}

export const config = {
  runtime: "nodejs",
  matcher: ["/admin/:path*", "/auth/:path*", "/account/:path*"],
};
