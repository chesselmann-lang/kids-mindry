import { test, expect } from '@playwright/test';

/**
 * Auth & DSGVO Protection E2E — mindry Kids
 * DSGVO Art. 8: child data must not be accessible without authentication
 */

test.describe('Unauthenticated access protection', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to /anmelden (login page)
    await expect(page).toHaveURL(/anmelden|login/i, { timeout: 5000 });
  });

  test('kinder (children list) redirects to login', async ({ page }) => {
    await page.goto('/kinder');
    await expect(page).toHaveURL(/anmelden|login/i, { timeout: 5000 });
  });

  test('portfolio route redirects to login', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveURL(/anmelden|login/i, { timeout: 5000 });
  });

  test('beobachtungsboegen redirects to login', async ({ page }) => {
    await page.goto('/beobachtungsboegen');
    await expect(page).toHaveURL(/anmelden|login/i, { timeout: 5000 });
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/anmelden');
    await expect(page.locator('body')).toContainText(/Anmelden|Login|E-Mail/i);
    // Should have email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('admin route redirects non-admin to feed', async ({ page }) => {
    // Accessing admin without auth should redirect to login or feed
    await page.goto('/admin');
    const url = page.url();
    expect(url).toMatch(/anmelden|login|feed/i);
  });
});
