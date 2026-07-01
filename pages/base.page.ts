import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a specific path relative to the config's baseURL.
   */
  async navigateTo(path: string = ''): Promise<void> {
    console.log(`[Navigation] Heading to path: "${path}"`);
    await this.page.goto(path);
  }

  /**
   * Custom helper to fill a field safely after ensuring it's interactable.
   */
  async safeFill(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }
}
