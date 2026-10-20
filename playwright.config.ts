import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { optionalEnv, requireEnv } from './config/env';

// Load .env from the repo root, next to this file.
dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)), quiet: true });

const isCI = !!process.env.CI;

// The app under test. Failing here beats navigating to an invalid URL later.
const baseURL = requireEnv('BASE_URL');

// Only needed when you have API specs; otherwise they must use absolute URLs.
const apiBaseURL = optionalEnv('API_BASE_URL');

const reporter: ReporterDescription[] = [
  ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
  // On CI we emit blob reports so sharded runs can be combined afterwards
  // with `npx playwright merge-reports` (see .github/workflows/playwright.yml).
  isCI
    ? ['blob', { outputDir: 'blob-report' }]
    : ['html', { outputFolder: 'reports', open: 'never' }],
];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry flaky tests on CI only */
  retries: isCI ? 2 : 0,
  /* Half the CPUs on CI, full parallelism locally */
  workers: isCI ? '50%' : undefined,
  /* Real flows (checkout, uploads) need more than Playwright's 30s default. */
  timeout: 60_000,
  reporter,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Pin locale and time so date/number assertions do not depend on the runner. */
    locale: 'en-US',
    timezoneId: 'UTC',

    /* Fail fast instead of hanging on CI when an element never appears. */
    actionTimeout: 15_000,
    /* Playwright's default is 30s; slow pages legitimately need it. */
    navigationTimeout: 30_000,

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
  ],
});
