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

const proxy = async (req: NextRequest): Promise<NextResponse> => {
  const t0: number = Date.now();
  const { nextUrl } = req;
  const session = await auth.api.getSession({ headers: req.headers });
  const isLoggedIn: boolean = !!session?.user;
  const user = session?.user;
  const pathname: string = nextUrl.pathname;
  const isAdminPath: boolean = pathname.startsWith("/admin");
  const isAccountPath: boolean = pathname.startsWith("/account");
  const allowlist: readonly string[] = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value: string): string => value.trim().toLowerCase())
    .filter(Boolean);
  if (user) {
    const isNotAllowedRoute: boolean = routesNotAllowedByLoggedInUsers.some((route: string): boolean =>
      new RegExp(`^${route}$`).test(pathname),
    );
    if (isNotAllowedRoute) {
      const res: NextResponse = NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      res.headers.set("Server-Timing", `proxy;desc=auth;dur=${Date.now() - t0}`);
      return res;
    }
    if (isAdminPath) {
      if (allowlist.length > 0) {
        const email: string | undefined = user.email?.toLowerCase();
        if (!email || !allowlist.includes(email)) {
          const res: NextResponse = NextResponse.redirect(new URL(Routes.Login, nextUrl));
          res.headers.set("Server-Timing", `proxy;desc=auth;dur=${Date.now() - t0}`);
          return res;
        }
      } else {
        const roles: readonly string[] = await getUserRoles(user.id);
        if (!roles.includes("admin")) {
          const res: NextResponse = NextResponse.redirect(new URL(Routes.Login, nextUrl));
          res.headers.set("Server-Timing", `proxy;desc=auth;dur=${Date.now() - t0}`);
          return res;
        }
      }
    }
  }
  const isProtectedRoute: boolean = protectedRoutes.some((route: string): boolean =>
    new RegExp(`^${route}$`).test(pathname),
  );
  if (!isLoggedIn && (isProtectedRoute || isAccountPath || isAdminPath)) {
    let callbackUrl: string = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl: string = encodeURIComponent(callbackUrl);
    const res: NextResponse = NextResponse.redirect(
      new URL(`${Routes.Login}?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
    res.headers.set("Server-Timing", `proxy;desc=auth;dur=${Date.now() - t0}`);
    return res;
  }
  const res: NextResponse = NextResponse.next();
  res.headers.set("Server-Timing", `proxy;desc=auth;dur=${Date.now() - t0}`);
  return res;
};

export default proxy;

export const config = {
  runtime: "nodejs",
  matcher: ["/admin/:path*", "/auth/:path*", "/account/:path*"],
};
