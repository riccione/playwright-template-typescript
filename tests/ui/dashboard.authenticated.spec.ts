import { test, expect } from '@fixtures/test-base';

/**
 * Runs in the `authenticated` project: the browser context starts pre-logged-in
 * via storageState saved by tests/auth.setup.ts, so there is no login step here.
 */
test('saved session opens the dashboard without logging in @regression', async ({
  dashboardPage,
}) => {
  await dashboardPage.goto();

  await expect(dashboardPage.status).toHaveText(/Welcome, /);
  await expect(dashboardPage.signOutButton).toBeVisible();
});
