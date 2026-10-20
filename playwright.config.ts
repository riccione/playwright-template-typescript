import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { optionalEnv, requireEnv } from './config/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically parse configurations from .env
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

// The app under test. Failing here beats navigating to an invalid URL later.
const baseURL = requireEnv('BASE_URL');

// Only needed when you have API specs; they may also use absolute URLs.
const apiBaseURL = optionalEnv('API_BASE_URL');

// On CI we emit blob reports so sharded runs can be combined afterwards
// with `npx playwright merge-reports` (see .github/workflows/playwright.yml).
const reporters = () => {
  const common: ReporterDescription[] = [
    ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
  ];
  return process.env.CI
    ? ([['blob', { outputDir: 'blob-report' }], ...common] as ReporterDescription[])
    : ([['html', { outputFolder: 'reports', open: 'never' }], ...common] as ReporterDescription[]);
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry flaky tests on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Half the CPUs on CI, full parallelism locally */
  workers: process.env.CI ? '50%' : undefined,
  reporter: reporters(),

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Fail fast instead of hanging on CI when an element never appears. */
    actionTimeout: 15_000,
    navigationTimeout: 15_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure', // Auto-capture on failure
    video: 'retain-on-failure', // Auto-recording on failure
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/api/**',
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/api/**',
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/api/**',
    },

    /* API tests need no browser and should not run per-browser. */
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
