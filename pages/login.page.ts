import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Define strongly typed properties for your selectors
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    // Pass the page context up to the parent BasePage class
    super(page);

    // Initialize locators using modern, resilient user-facing locators
    this.usernameInput = page.getByPlaceholder('Enter Username');
    this.passwordInput = page.getByPlaceholder('Enter Password');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.errorMessage = page.locator('.error-message-banner');
  }

  /**
   * High-level workflow wrapping the granular text inputs and click actions
   */
  async login(username: string, password: string): Promise<void> {
    console.log(`[Workflow] Attempting login for user: ${username}`);
    await this.safeFill(this.usernameInput, username);
    await this.safeFill(this.passwordInput, password);
    await this.loginButton.click();
  }

  async getErrorMessageText(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return this.errorMessage.innerText();
  }
}
