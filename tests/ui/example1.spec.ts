import { test, expect } from '../../fixtures/test-base';

test('verify homepage title verification path', async ({ page }) => {
  // 'page' arrives here ALREADY pre-navigated to '/' due to the setup block!
  await expect(page).toHaveTitle(/Playwright/);
});
