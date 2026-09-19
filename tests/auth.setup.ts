import { test as setup } from '@playwright/test';

/**
 * Setup project: runs once before all browser projects that depend on it.
 * TODO: perform the login flow here and persist the session with
 * `await page.context().storageState({ path: '.auth/user.json' })`
 * so tests can start authenticated via storageState instead of re-logging in.
 */
setup('environment check', async ({}, testInfo) => {
  const missing = ['BASE_URL', 'ADMIN_USER', 'ADMIN_PASSWORD'].filter((key) => !process.env[key]);

  if (missing.length) {
    testInfo.annotations.push({
      type: 'warning',
      description: `Missing env vars (${missing.join(', ')}); copy .env.example to .env. Defaults are in use.`,
    });
  }
});
