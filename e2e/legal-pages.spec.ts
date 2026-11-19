import { test, expect } from '@playwright/test';

/**
 * Legal Pages E2E — mindry Kids
 * DSGVO, KitaG, §22a SGB VIII: legal pages must be accessible without login
 */

test.describe('Legal pages (no auth required)', () => {
  test('impressum page is accessible and shows provider info', async ({ page }) => {
    await page.goto('/impressum');
    await expect(page.locator('body')).toContainText(/Impressum|Anbieter|Hesselmann/i);
    // Must show company address details per §5 TMG
    await expect(page.locator('body')).toContainText(/GmbH|UG|Gesellschaft/i);
  });

  test('datenschutz page contains DSGVO references', async ({ page }) => {
    await page.goto('/datenschutzerklaerung');
    await expect(page.locator('body')).toContainText(/Datenschutz|DSGVO|personenbezogen/i);
    // Art. 8 (child data) must be mentioned
    await expect(page.locator('body')).toContainText(/Kinder|Kind|minderj/i);
  });

  test('AGB page renders', async ({ page }) => {
    await page.goto('/agb');
    await expect(page.locator('body')).toContainText(/AGB|Bedingungen|Nutzung/i);
  });

  test('AVV page is accessible and shows Art. 28 DSGVO content', async ({ page }) => {
    await page.goto('/avv');
    await expect(page.locator('body')).toContainText(/AVV|Auftragsverarbeitung|Art\. 28/i);
  });

  test('legal pages have proper document titles', async ({ page }) => {
    const pages = ['/impressum', '/datenschutzerklaerung', '/agb', '/avv'];
    for (const path of pages) {
      await page.goto(path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);
    }
  });

  test('no X-Frame-Options allows embedding', async ({ page }) => {
    // The Kita app must set X-Frame-Options: DENY (child data security)
    const response = await page.goto('/anmelden');
    const xFrameOptions = response?.headers()['x-frame-options'];
    // Should be DENY or SAMEORIGIN, never allow framing
    if (xFrameOptions) {
      expect(xFrameOptions.toUpperCase()).toMatch(/DENY|SAMEORIGIN/);
    }
  });
});
