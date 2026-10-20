import { test as base } from '@playwright/test';

/**
 * Register your page objects here so every spec can use them as fixtures.
 *
 *   import { LoginPage } from '@pages/login.page';
 *
 *   type Fixtures = {
 *     loginPage: LoginPage;
 *   };
 *
 *   export const test = base.extend<Fixtures>({
 *     loginPage: async ({ page }, use) => {
 *       await use(new LoginPage(page));
 *     },
 *   });
 *
 * Specs then import both from here: `import { test, expect } from '@fixtures/test-base';`
 */
export const test = base.extend({});

export { expect } from '@playwright/test';
