import { defineConfig, devices } from '@playwright/test';

/**
 * Mindry Kids — Playwright E2E Configuration
 * Target: https://kids.mindry.de (prod) / http://localhost:3000 (dev)
 *
 * Test strategy:
 *  - DSGVO Art. 8: child data protection — no unauthenticated access
 *  - Role gating: Erzieherin / Leitung / Elternteil access boundaries
 *  - Beobachtungsbögen: BaSiK, SISMIK, PERIK render correctly
 *  - Portfolio: kind-specific routes isolated
 *  - Legal compliance: AVV, Datenschutz, AGB pages present
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'on-failure' }]],

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-safari',  use: { ...devices['iPhone 14'] } },
    { name: 'mobile-chrome',  use: { ...devices['Pixel 7'] } },
  ],

  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
