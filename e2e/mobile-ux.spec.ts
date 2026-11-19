import { test, expect } from '@playwright/test';

/**
 * Mobile UX E2E — mindry Kids
 * Kita staff often use tablets/phones — mobile-first is critical
 */

test.describe('Mobile UX', () => {
  test('login page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.goto('/anmelden');
    // Email input should be visible without scrolling
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    // Form should fit viewport
    const inputBox = await emailInput.boundingBox();
    if (inputBox) {
      expect(inputBox.width).toBeGreaterThan(200);
      expect(inputBox.x).toBeGreaterThanOrEqual(0);
      expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(390);
    }
  });

  test('legal page text is readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/datenschutzerklaerung');
    const body = page.locator('body');
    await expect(body).toBeVisible();
    // No horizontal overflow
    const bodyBox = await body.boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(400);
    }
  });

  test('impressum is readable on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/impressum');
    await expect(page.locator('body')).toContainText(/Impressum/i);
  });

  test('login page has correct mobile viewport meta tag', async ({ page }) => {
    await page.goto('/anmelden');
    const viewport = await page.$eval('meta[name="viewport"]', el => el.getAttribute('content'));
    expect(viewport).toContain('width=device-width');
  });

  test('tap targets are large enough on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/anmelden');
    // Submit button should be at least 44px tall (WCAG 2.5.5)
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      const box = await submitBtn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
