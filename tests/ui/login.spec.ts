/* eslint-disable playwright/no-skipped-test */
import { test, expect } from '@fixtures/test-base';

test.skip('verify invalid login triggers error banner', async ({ loginPage }) => {
  await loginPage.navigateTo('/login');
  await loginPage.login('wrong_user', 'bad_password');

  // Await the string from the page object first
  const errorMessage = await loginPage.getErrorMessageText();

  // Pass it synchronously into expect (no await at the front)
  expect(errorMessage).toContain('Invalid credentials');
});
