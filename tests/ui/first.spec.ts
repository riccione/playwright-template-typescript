/* eslint-disable playwright/no-skipped-test -- placeholder until you write your first test */
import { test, expect } from '@fixtures/test-base';

/**
 * Replace this file with your first test. Keep the assertions web-first
 * (`expect(locator).toBeVisible()`) so they retry until the UI settles.
 *
 * Page objects live in `pages/`, and are handed to specs as fixtures via
 * `fixtures/test-base.ts`.
 */
test.skip('replace this with your first test', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/./);
});
