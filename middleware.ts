import { auth } from "@/lib/auth/auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  Routes,
  protectedRoutes,
  routesNotAllowedByLoggedInUsers,
} from "@/routes";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const { nextUrl } = req;
  const session = await auth.api.getSession({ headers: req.headers });
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;
  if (isLoggedIn) {
    const isNotAllowedRoute = routesNotAllowedByLoggedInUsers.some((route: string) =>
      new RegExp(`^${route}$`).test(pathname),
    );
    if (isNotAllowedRoute) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
  }
  const isProtectedRoute = protectedRoutes.some((route: string) =>
    new RegExp(`^${route}$`).test(pathname),
  );
  if (!isLoggedIn && isProtectedRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`${Routes.Login}?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }
  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/admin/:path*", "/auth/:path*"],
};
