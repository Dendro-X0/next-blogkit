"use server";

import i18nConfig from "@/i18n/config";
import { cookies } from "next/headers";

/**
 * Sets the UI locale cookie from a form submission.
 * Accepts a FormData with a "locale" field matching one of the allowed locales.
 */
export default async function setLocale(formData: FormData): Promise<void> {
  const raw = formData.get("locale");
  const value = typeof raw === "string" ? raw : "";
  const isAllowed = (val: string): val is (typeof i18nConfig)["locales"][number] => {
    return (i18nConfig.locales as readonly string[]).includes(val);
  };
  const locale = isAllowed(value) ? value : i18nConfig.defaultLocale;
  const jar = await cookies();
  jar.set(i18nConfig.cookieName, locale, {
    path: "/",
    maxAge: i18nConfig.cookieMaxAgeSeconds,
    sameSite: "lax",
  });
}
