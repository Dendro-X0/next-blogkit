/**
 * i18n configuration used across server and client.
 */
const i18nConfig = {
  locales: ["en", "es"] as const,
  defaultLocale: "en" as const,
  cookieName: "LOCALE" as const,
  cookieMaxAgeSeconds: 31536000 as const,
} as const;

export default i18nConfig;
