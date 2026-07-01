import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

// Add page object types to your fixture definition context
type MyFixtures = {
  authenticatedPage: import('@playwright/test').Page;
  loginPage: LoginPage;
};

// Extend the base Playwright test object
export const test = base.extend<MyFixtures>({
  // Override the default 'page' fixture with custom lifecycle logic
  page: async ({ page }, use) => {
    // ------------------ SETUP ------------------
    console.log('[Test Setup] Navigating to target environment context...');
    await page.goto('/');

    // Pass the prepared page context down to the test execution loop
    await use(page);

    // ----------------- TEARDOWN -----------------
    console.log('[Test Teardown] Cleaning temporary storage parameters...');
    await page.context().clearCookies();
  },

  // You can create brand new fixtures here too! (e.g., an authenticated session)
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('#user', process.env.ADMIN_USER || '');
    await page.fill('#pass', process.env.ADMIN_PASSWORD || '');
    await page.click('#submit');

    await use(page); // Passes the logged-in page to the test
  },

  loginPage: async ({ page }, use) => {
    // Automatically instantiate the object and pass it to the test
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

// Re-export expect so tests only need to import from this single base file
export { expect } from '@playwright/test';
