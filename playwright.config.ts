import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AUTH_FILE } from './tests/credentials';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically parse configurations from .env
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

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
    /* Base URL to use in actions like `await page.goto('')`. Points at the
       bundled demo app by default; override via .env for real targets. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Fail fast instead of hanging on CI when an element never appears. */
    actionTimeout: 15_000,
    navigationTimeout: 15_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure', // Auto-capture on failure
    video: 'retain-on-failure', // Auto-recording on failure
  },

  /* Local demo app (login/POM/auth examples run against it). Swap BASE_URL
     in .env to point at your real app and this server simply goes unused. */
  webServer: {
    command: 'node demo-app/server.mjs',
    url: process.env.BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  /* Configure projects for major browsers */
  projects: [
    /* Runs first; browser projects depend on it (saves .auth/user.json). */
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: ['**/api/**', '**/*.authenticated.spec.ts'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: ['**/api/**', '**/*.authenticated.spec.ts'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: ['**/api/**', '**/*.authenticated.spec.ts'],
    },

    /* Specs tagged *.authenticated.spec.ts boot pre-logged-in from the
       session saved by the setup project. */
    {
      name: 'authenticated',
      testMatch: /.*\.authenticated\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
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
