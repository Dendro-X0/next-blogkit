import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E tests.
 * - Uses a dev server by default (pnpm dev) for fast local runs.
 * - Set PLAYWRIGHT_WEB_COMMAND="pnpm start" (and build first) for prod-like runs.
 * - Override baseURL with PLAYWRIGHT_BASE_URL if needed.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_WEB_COMMAND || "pnpm dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
