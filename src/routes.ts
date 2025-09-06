import { websiteConfig } from "./config/website";

export enum Routes {
  Login = "/auth/login",
  Register = "/auth/register",
  Admin = "/admin",
}

/**
 * The routes that can not be accessed by logged in users
 */
export const routesNotAllowedByLoggedInUsers = [Routes.Login, Routes.Register];

/**
 * The routes that are protected and require authentication
 */
export const protectedRoutes = [Routes.Admin];

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT = websiteConfig.routes.defaultLoginRedirect ?? Routes.Admin;
