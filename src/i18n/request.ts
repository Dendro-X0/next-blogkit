import i18nConfig from "@/i18n/config";
import type { AbstractIntlMessages } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

/**
 * Request-scoped i18n configuration.
 * Reads the LOCALE cookie and falls back to default.
 */
export default getRequestConfig(async () => {
  const h = await headers();
  const cookieHeader = h.get("cookie") ?? "";
  const raw = parseCookie(cookieHeader, i18nConfig.cookieName);
  const allowed = i18nConfig.locales as readonly string[];
  type Locale = (typeof i18nConfig)["locales"][number];
  const selected = raw && allowed.includes(raw) ? raw : i18nConfig.defaultLocale;
  const locale = selected as Locale;
  const messages: AbstractIntlMessages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});

function parseCookie(header: string, name: string): string | undefined {
  const parts = header.split(";");
  for (const part of parts) {
    const [k, v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v ?? "");
  }
  return undefined;
}
