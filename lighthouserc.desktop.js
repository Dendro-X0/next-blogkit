/** Lighthouse CI configuration for BlogKit (desktop). */
module.exports = {
  ci: {
    collect: {
      // Start the production server before running audits
      startServerCommand: "pnpm start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 120000,
      // Use the lhci=1 flag so analytics and extra tracking are disabled
      url: [
        "http://localhost:3000/?lhci=1",
        "http://localhost:3000/blog?lhci=1",
        "http://localhost:3000/contact?lhci=1",
        "http://localhost:3000/search?lhci=1",
        "http://localhost:3000/auth/login?lhci=1",
      ],
      numberOfRuns: 3,
      settings: {
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          disabled: false,
        },
      },
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
