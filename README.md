# Playwright + TypeScript E2E Template

A starting point for end-to-end tests with [Playwright](https://playwright.dev) and TypeScript:
typed page objects, shared fixtures, quality gates, three CI blueprints, and HTML + Allure
reporting. There is no demo app and no example suite — point it at your app and write tests.

## What you get

- **ESM + strict TypeScript** with path aliases (`@pages`, `@fixtures`, `@tests`, `@config`)
- **Project matrix**: `chromium`, `firefox`, `webkit` and a browserless `api` project
- **Quality gates**: ESLint (incl. `eslint-plugin-playwright`), Prettier, `tsc --noEmit`, pre-commit hooks
- **CI blueprints**: GitHub Actions (2 shards, merged reports), GitLab CI, Jenkins
- **Reports**: Playwright HTML locally, Allure 3 results, blob reports for CI sharding
- **Containerized runs**: Dockerfile + Compose, with a `.dockerignore` that keeps secrets out

## Requirements

- Node.js `>= 22` (`.nvmrc` pins the version used by CI)
- Playwright browsers: `npx playwright install --with-deps`

## First 10 minutes with your app

**1. Install**

```bash
npm ci
npx playwright install --with-deps
npm run prepare        # installs the pre-commit hooks (needs pre-commit on PATH)
```

**2. Point it at your app**

```bash
cp .env.example .env
```

```ini
# .env
BASE_URL=https://your-app.example.com
API_BASE_URL=https://your-api.example.com   # only if you have API specs
ADMIN_USER=you@example.com                  # only if you add a login flow
ADMIN_PASSWORD=...
```

`BASE_URL` is required — without it the config fails immediately with that message instead of
a cryptic navigation error.

**3. Add a page object** in `pages/`:

```typescript
// pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.usernameInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign in' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

**4. Hand it to your specs** as a fixture in `fixtures/test-base.ts`:

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';

type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';
```

**5. Write a test** in `tests/ui/` (replace `tests/ui/first.spec.ts`):

```typescript
import { test, expect } from '@fixtures/test-base';

test('user can sign in @smoke', async ({ loginPage, page }) => {
  await page.goto('/login');
  await loginPage.login('you@example.com', 'secret');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

**6. Run it**

```bash
npm test                 # all projects
npm run test:chromium    # one browser
npm run test:smoke       # only @smoke-tagged specs
npm run test:headed      # watch it happen
npm run test:ui          # Playwright UI mode
```

## Project layout

```text
├── .github/workflows/playwright.yml # GitHub Actions: quality -> test(2 shards) -> report
├── .gitlab-ci.yml           # GitLab CI blueprint
├── Jenkinsfile              # Jenkins Declarative pipeline
├── .dockerignore           # keeps .env and artifacts out of the image
├── .env.example             # copy to .env and fill in
├── .nvmrc                   # pinned Node version
├── .pre-commit-config.yaml  # prettier + eslint + tsc on every commit
├── config/env.ts            # requireEnv/optionalEnv: fail fast on missing config
├── fixtures/test-base.ts    # register your page objects here
├── pages/                   # your page objects (POM)
├── tests/
│   ├── api/                 # request-fixture specs (own `api` project)
│   └── ui/                  # browser specs
├── eslint.config.mjs
├── playwright.config.ts     # projects, reporters, timeouts
└── tsconfig.json            # ESM + path aliases
```

## Conventions

- **Locators**: `getByRole()`, `getByLabel()`, `getByText()` — no CSS classes, no XPath.
  Keep them on the page object and expose them publicly.
- **Assertions**: web-first, always awaited — `await expect(locator).toBeVisible()`. Never
  `waitForTimeout`, never `expect(await something()).toContain(...)`.
- **Navigation**: the spec navigates (`await page.goto('/login')`). There is no auto-navigating
  `page` fixture — hidden setup makes failures hard to read.
- **Tags**: `@smoke` / `@regression` in the test title drive `npm run test:smoke` / `test:regression`.
- **No `console.log`**: ESLint rejects it. Use the test title for context.
- **Credentials**: never in code or fixtures — read them from the environment.

## Adding authentication (log in once, reuse the session)

Copy these two pieces into your project; they are not shipped because the login flow is
app-specific.

**`tests/auth.setup.ts`** — a setup project logs in once and saves the session:

```typescript
import { mkdirSync } from 'fs';
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { requireEnv } from '@config/env';

const AUTH_FILE = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  mkdirSync('.auth', { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(requireEnv('ADMIN_USER'), requireEnv('ADMIN_PASSWORD'));

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
```

**`playwright.config.ts`** — add a `setup` project plus an `authenticated` project that boots
pre-logged-in:

```typescript
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    dependencies: ['setup'],
    testIgnore: ['**/api/**', '**/*.authenticated.spec.ts'],
  },
  {
    name: 'authenticated',
    testMatch: /.*\.authenticated\.spec\.ts/,
    use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
    dependencies: ['setup'],
  },
]
```

Specs named `*.authenticated.spec.ts` then start already signed in — no login step, no
re-authentication per test. `.auth/` is already in `.gitignore`; never commit the session file.

## API testing

API specs live in `tests/api/` and run in the browserless `api` project (once, not per browser):

```typescript
import { test, expect } from '@playwright/test';

test('lists users', async ({ request }) => {
  const response = await request.get('/users'); // relative to API_BASE_URL

  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toHaveLength(3);
});
```

Set `API_BASE_URL` (local `.env`, CI secret/variable) or use absolute URLs in the spec.

## npm scripts

| Script | What it does |
|---|---|
| `npm test` | Run every project |
| `npm run test:chromium` / `:firefox` / `:webkit` | One browser |
| `npm run test:api` | API project only |
| `npm run test:smoke` / `test:regression` | Tag-filtered runs |
| `npm run test:ui` / `test:headed` / `test:debug` | UI mode, visible browser, inspector |
| `npm run test:report` | Open the last HTML report |
| `npm run test:docker` | Run the suite in Docker |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint:check` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |

## CI/CD

Every pipeline needs the app URL. Provide it as a secret/variable — the config requires it:

| Platform | Where to define it |
|---|---|
| GitHub Actions | Repository secrets `BASE_URL` (required) and `API_BASE_URL` (optional) |
| GitLab CI | Project CI/CD variables `BASE_URL`, `API_BASE_URL` |
| Jenkins | Global environment variables or pipeline parameters |

GitHub Actions runs three jobs:

1. `quality` — lint, format check, typecheck
2. `test` — the suite split into 2 shards, each uploading blob + Allure results
3. `report` — merges the shards into one HTML report and generates the Allure dashboard

Artifacts: `playwright-report` and `allure-report` (30 days). Locally, the HTML report lands in
`reports/` and the Allure results in `allure-results/`.

## Docker

```bash
npm run test:docker                       # build and run the whole suite
docker compose run --rm playwright npx playwright test --headed
```

The image tag (`mcr.microsoft.com/playwright:v1.61.1-noble`) is kept in lockstep with the
exact `@playwright/test` version in `package.json` — bump both together. `.env` is passed to
the container through Compose, and `.dockerignore` keeps it out of the image itself.

## Quality gates

```bash
npm run typecheck
npm run lint:check
npm run format:check
```

The same three run in CI and in the pre-commit hooks:

```bash
npm run prepare          # install hooks (pre-commit must be on PATH)
pre-commit run --all-files
```

## Reports

```bash
npm test                                  # writes reports/ (HTML) and allure-results/
npm run test:report                       # opens the HTML report

npx allure generate allure-results --clean -o allure-report
npx allure serve allure-results           # interactive dashboard
```

The Allure CLI comes from the `allure-commandline` dev dependency (no global install needed).

## License

MIT — see [LICENSE](LICENSE).
