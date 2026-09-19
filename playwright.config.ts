import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically parse configurations from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

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
    baseURL: process.env.BASE_URL || 'https://playwright.dev/',

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
    /* Runs first; browser projects depend on it (e.g. for session state). */
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: '**/api/**',
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: '**/api/**',
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: '**/api/**',
    },

    /* API tests need no browser and should not run per-browser. */
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    //   dependencies: ['setup'],
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    //   dependencies: ['setup'],
    // },
  ],
});
