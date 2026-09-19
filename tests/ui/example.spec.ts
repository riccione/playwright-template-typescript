import { test, expect } from '@fixtures/test-base';

/**
 * Intro examples: plain `page` usage, no page objects.
 * For larger suites prefer the POM pattern shown in login.spec.ts.
 */
test('sign-in page renders @smoke', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Sign in/);
});

test('empty credentials are rejected @smoke', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByRole('alert')).toHaveText('Invalid credentials');
});
