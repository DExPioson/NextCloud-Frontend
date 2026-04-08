import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Authentication", () => {
  test("Login page renders correctly", async ({ page }) => {
    await page.goto("/#/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1:has-text('CloudSpace')")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("Login fails with wrong credentials", async ({ page }) => {
    await page.goto("/#/login");
    await page.waitForLoadState("networkidle");
    await page.locator("#email").fill("wrong@email.com");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[role="alert"]')).toContainText("Invalid credentials");
    expect(page.url()).toContain("/#/login");
  });

  test("Login succeeds with correct credentials", async ({ page }) => {
    await login(page);
    expect(page.url()).toMatch(/\/#\/$/);
    // Dashboard should load with greeting containing Piyush
    await expect(page.locator("text=Piyush").first()).toBeVisible({ timeout: 5000 });
  });

  test("Sign out via user dropdown", async ({ page }) => {
    await login(page);
    await page.locator("header").locator("text=PS").click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL(/\/#\/login/);
  });
});
