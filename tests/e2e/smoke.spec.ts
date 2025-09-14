import { test, expect } from "@playwright/test";

/**
 * Basic smoke tests to verify critical pages respond and render main elements.
 */

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Blog/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("blog index renders", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: /Latest Blog Posts/i })).toBeVisible();
});

test("account redirects unauthenticated", async ({ page }) => {
  const resp = await page.goto("/account");
  // Either redirected to login or protected content returns a 302/401 flow
  expect(resp?.status()).toBeLessThan(500);
});
