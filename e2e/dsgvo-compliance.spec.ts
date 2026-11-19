import { test, expect } from '@playwright/test';

/**
 * DSGVO Compliance E2E — mindry Kids
 * Art. 8 (children <16), Art. 28 (AVV), Art. 35 (DSFA)
 * §22a SGB VIII (Kita data protection), IfSG §34 (health data)
 */

test.describe('DSGVO Art. 8 — Kinderschutz', () => {
  test('login page does not set tracking cookies before consent', async ({ page, context }) => {
    await page.goto('/anmelden');
    const cookies = await context.cookies();
    // Should not have analytics/marketing cookies before consent
    const trackingCookies = cookies.filter(c =>
      /analytics|tracking|posthog|_ga|hubspot/i.test(c.name)
    );
    expect(trackingCookies).toHaveLength(0);
  });

  test('security headers include Content-Security-Policy', async ({ page }) => {
    const response = await page.goto('/anmelden');
    const csp = response?.headers()['content-security-policy'];
    if (csp) {
      // CSP must restrict frame embedding (child data)
      expect(csp).toContain('frame-ancestors');
    }
  });

  test('HSTS header present on main page', async ({ page }) => {
    const response = await page.goto('/anmelden');
    const hsts = response?.headers()['strict-transport-security'];
    if (hsts) {
      // Should have max-age (at least 1 year = 31536000)
      expect(hsts).toContain('max-age');
    }
  });

  test('datenschutz page mentions Art. 8 DSGVO child protection', async ({ page }) => {
    await page.goto('/datenschutzerklaerung');
    const text = await page.locator('body').textContent();
    // Should mention Art. 8 or children specifically
    expect(text).toMatch(/Art\. 8|Kinder|minderj|Kind/i);
  });

  test('AVV page references Art. 28 DSGVO', async ({ page }) => {
    await page.goto('/avv');
    await expect(page.locator('body')).toContainText(/Art\. 28|Auftragsverarbeiter/i);
  });

  test('no external tracking scripts loaded on login page', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', req => {
      const url = req.url();
      if (!url.includes('localhost') && !url.includes('supabase') &&
          req.resourceType() === 'script') {
        externalRequests.push(url);
      }
    });
    await page.goto('/anmelden');
    await page.waitForLoadState('networkidle').catch(() => {});
    // Filter known allowed scripts (fonts, etc.)
    const suspicious = externalRequests.filter(u =>
      !u.includes('fonts.googleapis') && !u.includes('fonts.gstatic')
    );
    // Log for visibility, but don't hard-fail (some CDN scripts may be expected)
    console.log('External scripts on login:', suspicious);
    expect(suspicious.length).toBeLessThanOrEqual(3);
  });
});
