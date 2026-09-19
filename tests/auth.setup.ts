import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { DashboardPage } from '@pages/dashboard.page';
import { AUTH_FILE, demoCredentials } from '@tests/credentials';

/**
 * Runs once before all projects that depend on it. Performs the UI login
 * a single time and persists the session, so authenticated specs can boot
 * straight into the app via storageState instead of re-typing credentials.
 */
setup('authenticate', async ({ page }) => {
  mkdirSync(dirname(AUTH_FILE), { recursive: true });

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const { username, password } = demoCredentials();

  await loginPage.goto();
  await loginPage.login(username, password);

  // Fail the whole run early (and loudly) if the session was never established
  await expect(dashboardPage.status).toHaveText(/Welcome, /);

  await page.context().storageState({ path: AUTH_FILE });
});
