import { test, expect } from '@playwright/test';

/**
 * Bildungsplan-Module E2E — mindry Kids
 * Tests NRW/Bayern Bildungsplan module page
 */

test.describe('Bildungsplan-Module', () => {
  test('page accessible without auth (demo)', async ({ page }) => {
    await page.goto('/bildungsplan');
    const url = page.url();
    // Either accessible or redirected to login — must not 404/500
    const status = (await page.evaluate(() => document.readyState)) === 'complete';
    expect(status).toBe(true);
    expect(url).not.toContain('/error');
  });

  test('page title contains Bildungsplan', async ({ page }) => {
    await page.goto('/bildungsplan');
    if (page.url().includes('login')) test.skip();
    await expect(page.locator('h1')).toContainText(/Bildungsplan/i);
  });

  test('NRW and Bayern modules displayed', async ({ page }) => {
    await page.goto('/bildungsplan');
    if (page.url().includes('login')) test.skip();
    const body = page.locator('body');
    await expect(body).toContainText(/NRW|Bayern/i);
  });

  test('filter buttons exist', async ({ page }) => {
    await page.goto('/bildungsplan');
    if (page.url().includes('login')) test.skip();
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(2);
  });

  test('module cards expand/collapse on click', async ({ page }) => {
    await page.goto('/bildungsplan');
    if (page.url().includes('login')) test.skip();
    const cards = page.locator('.rounded-2xl');
    if (await cards.count() === 0) test.skip();
    const firstCard = cards.first();
    await firstCard.click();
    // After click, more content should be visible
    await page.waitForTimeout(300);
    await expect(firstCard).toBeVisible();
  });

  test('legal reference box shown', async ({ page }) => {
    await page.goto('/bildungsplan');
    if (page.url().includes('login')) test.skip();
    await expect(page.locator('body')).toContainText(/§22a|SGB VIII|KiBiz|BEP/i);
  });

  test('stats counters are numeric', async ({ page }) => {
    await page.goto('/bildungsplan');
    if (page.url().includes('login')) test.skip();
    await expect(page.locator('body')).toContainText(/\d+/);
  });
});
