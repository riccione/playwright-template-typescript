import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Define strongly typed properties for your selectors
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators using modern, resilient user-facing locators
    this.usernameInput = page.getByPlaceholder('Enter Username');
    this.passwordInput = page.getByPlaceholder('Enter Password');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.errorMessage = page.locator('.error-message-banner');
  }

  /**
   * Navigates to the login page relative to the config's baseURL.
   */
  async goto(path: string = '/login'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * High-level workflow wrapping the granular text inputs and click actions
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessageText(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return this.errorMessage.innerText();
  }
}
