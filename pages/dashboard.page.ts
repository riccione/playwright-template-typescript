import { Page, Locator } from '@playwright/test';

/**
 * Page object for the demo app dashboard (demo-app/dashboard.html).
 * The heading reflects session state: "Welcome, <user>" or "Not signed in".
 */
export class DashboardPage {
  readonly page: Page;

  readonly status: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.status = page.getByRole('heading', { level: 1 });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard.html');
  }
}
