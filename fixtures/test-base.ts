import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

/**
 * Extend the built-in Playwright fixtures with page objects so tests only
 * need to import `test`/`expect` from this one file.
 *
 * Authenticated tests do NOT log in here: the `setup` project saves the
 * session to .auth/user.json and the `authenticated` project boots from it
 * via storageState. See tests/auth.setup.ts.
 */
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
