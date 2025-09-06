export const websiteConfig = {
  routes: {
    defaultLoginRedirect: "/admin",
  },
  i18n: {
    defaultLocale: "en",
    locales: {
      en: {
        name: "English",
      },
      de: {
        name: "Deutsch",
      },
    },
  },
  analytics: {
    enableVercelAnalytics: true,
    enableSpeedInsights: true,
    enableFirstPartyAnalytics: true,
  },
};
