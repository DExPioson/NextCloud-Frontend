import { type Page, expect } from "@playwright/test";

export const BASE_URL = "http://localhost:5173";

export async function login(page: Page) {
  // Try using the pre-established storageState session first
  await page.goto("/#/");
  await page.waitForLoadState("networkidle");

  // If the dashboard loaded (sidebar visible, not redirected to /login), session is valid
  const onLogin = page.url().includes("/login");
  const sidebarVisible = !onLogin && await page.locator("aside").isVisible().catch(() => false);

  if (sidebarVisible) {
    // Session is valid — no need to fill the login form
    return;
  }

  // Session missing or expired — do full form login
  await page.goto("/#/login");
  await page.waitForLoadState("networkidle");
  await page.locator("#email").fill("piyush@cloudspace.home");
  await page.locator("#password").fill("cloudspace123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/#\/$/);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("aside")).toBeVisible();
}

/** Wait for the cs-toast element to appear with optional text match */
export async function expectToast(page: Page, textMatch?: string | RegExp) {
  const toast = page.locator("#cs-toast");
  await expect(toast).toBeVisible({ timeout: 5000 });
  if (textMatch) {
    if (typeof textMatch === "string") {
      await expect(toast).toContainText(textMatch);
    } else {
      await expect(toast).toHaveText(textMatch);
    }
  }
}

/** Navigate to a hash route after login */
export async function navigateTo(page: Page, path: string) {
  await page.goto(`/#${path}`);
  await page.waitForLoadState("networkidle");
}

/** Wait for API data to load (network idle) */
export async function waitForData(page: Page) {
  await page.waitForLoadState("networkidle");
}
