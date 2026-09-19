import { test, expect } from '@fixtures/test-base';
import { demoCredentials } from '@tests/credentials';

const { username, password } = demoCredentials();

test('valid login reaches the dashboard @smoke', async ({ dashboardPage, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(username, password);

  await expect(dashboardPage.status).toHaveText(/Welcome, /);
});

test('invalid login shows error banner @regression', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(username, 'totally-wrong');

  await expect(loginPage.alert).toHaveText('Invalid credentials');
});

test('anonymous visitors are told they are not signed in @regression', async ({
  dashboardPage,
}) => {
  await dashboardPage.goto();

  await expect(dashboardPage.status).toHaveText('Not signed in');
});
