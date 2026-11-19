import { test, expect } from '@playwright/test';

/**
 * Beobachtungsbögen E2E — mindry Kids
 * BaSiK, SISMIK, PERIK observation sheets
 * Note: Requires authentication — tests run against local dev with seeded user,
 * or against a mock auth session set in playwright global setup.
 */

const MOCK_COOKIE = process.env.PLAYWRIGHT_SESSION_COOKIE ?? '';

test.describe('Beobachtungsbögen (authenticated)', () => {
  test.skip(!MOCK_COOKIE, 'Requires PLAYWRIGHT_SESSION_COOKIE env var for auth');

  test.beforeEach(async ({ page, context }) => {
    if (MOCK_COOKIE) {
      await context.addCookies([{
        name: 'sb-swrtduckugkxzrfrbgav-auth-token',
        value: MOCK_COOKIE,
        domain: 'localhost',
        path: '/',
      }]);
    }
  });

  test('beobachtungsboegen page renders instrument selection', async ({ page }) => {
    await page.goto('/beobachtungsboegen');
    await expect(page.locator('body')).toContainText(/BaSiK|SISMIK|PERIK/i);
  });

  test('BaSiK instrument shows language development categories', async ({ page }) => {
    await page.goto('/beobachtungsboegen');
    await expect(page.locator('body')).toContainText(/Sprach|Kommunikation|Wortschatz/i);
  });

  test('SISMIK instrument mentions DaZ / migration background', async ({ page }) => {
    await page.goto('/beobachtungsboegen');
    await expect(page.locator('body')).toContainText(/Migration|DaZ|Zweitsprache/i);
  });

  test('PERIK instrument covers social-emotional development', async ({ page }) => {
    await page.goto('/beobachtungsboegen');
    await expect(page.locator('body')).toContainText(/sozial|emotional|Resilienz/i);
  });
});

// Public smoke tests that don't require auth
test.describe('Beobachtungsbögen (public smoke)', () => {
  test('unauthenticated access to beobachtungsboegen redirects', async ({ page }) => {
    await page.goto('/beobachtungsboegen');
    // Should redirect to login
    const url = page.url();
    expect(url).toMatch(/anmelden|login/i);
  });
});
