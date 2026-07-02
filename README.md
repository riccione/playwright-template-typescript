# Playwright TypeScript Test Automation Framework

A modern, highly optimized End-to-End (E2E) UI testing template using TypeScript,
`@playwright/test`, and native package ecosystem compilation engines for lightning-fast automation pipelines.

This framework implements a decoupled Page Object Model (POM) architecture,
cross-browser support, test lifecycle tracking, linting quality gates, and dual-reporting capability
(Playwright HTML & Allure 3) featuring automated screenshot and video capture upon
test failures.

---

## Features

- **Strict Type Safety**: Full TypeScript integration guarantees compile-time check validation across selectors, fixtures, and workflows.
- **Page Object Model (POM)**: Fully decoupled architecture separating page selectors from business workflows.
- **Configuration Management**: Centralized environment parsing via custom configurations or standard process bindings to eliminate hardcoded secrets.
- **Code Quality & Enforcement**: Built-in automated linting and formatting via `eslint` and `prettier` backed by `pre-commit` git hooks.
- **Dynamic Dual Reporting**: Built-in compatibility for choosing lightweight native `playwright-html` tracking or fully enterprise-grade `Allure 3` visual dashboards.
- **Rich Failure Artifacts**: Automated hook interception captures full-page browser screenshots and saves screen recordings explicitly on test failure conditions.
- **Universal CI/CD Ready**: Native multi-platform workflow blueprints provided out-of-the-box for GitHub Actions, GitLab CI, and Jenkins.

---

## Directory Structure

```text
├── .github/workflows/playwright.yml # GitHub Actions pipeline blueprint
├── .gitlab-ci.yml           # GitLab CI orchestration blueprint
├── .env.example             # Safe template for tracking configuration variables
├── .gitignore               # Strict untracked execution pattern matching
├── .pre-commit-config.yaml  # Intercepts git loops to enforce styling gates
├── Jenkinsfile              # Jenkins Declarative pipeline engine script
├── LICENSE                  # MIT License agreement
├── playwright.config.ts     # Root-level configuration file for execution flags
├── tsconfig.json            # Base path aliases and compiler configuration paths
├── package.json             # Project definitions and package dependencies
├── fixtures/
│   └── test-base.ts         # Custom fixtures providing encapsulated page instances
├── pages/
│   ├── base.page.ts         # Core Page Object wrapper handling Playwright components
│   └── login.page.ts        # Clean workflow extension decoupling logic from selectors
└── tests/
    ├── api/                 # API test examples (request fixture, CRUD operations)
    ├── regression/          # [.gitkeep] Broad validation execution scripts
    ├── smoke/               # [.gitkeep] High priority critical path milestones
    └── ui/
        ├── example.spec.ts   # Basic Playwright example tests
        ├── example1.spec.ts  # Homepage title verification test
        └── login.spec.ts     # UI test suites and regression scripts

```

---

## Prerequisites & Installation

### 1. Initialize Your Environment

Make sure you have Node.js installed. Then, fetch dependency packages and set up your local development linting tools:

```bash
# Clean install package specifications out of package.json
npm install

# Install native Playwright system browser binaries
npx playwright install --with-deps

# Bind local pre-commit hooks to your git lifecycle hooks context
npm run prepare # if using husky or pre-commit wrappers

```

### 2. Environment Configurations Setup

The framework leverages automated `.env` loading. Create your local context tracking files before launching scripts:

```bash
cp .env.example .env

```

Open your newly created `.env` file and customize your workspace targets securely:

```ini
BASE_URL=https://playwright.dev/
ADMIN_USER=your_private_username
ADMIN_PASSWORD=your_private_password

```

### 3. (Optional) Allure 3 Dashboard Engine

To spin up interactive Allure reporting, your host machine requires the Allure command-line utility binary. [https://allurereport.org/docs/v3/install/](https://allurereport.org/docs/v3/install/)

```bash
npm install -g allure

```

---

## Run Tests & Generate Reports

The suite is designed to change its reporting layout dynamically depending on the execution parameters passed down through the terminal command:

### Quick Start with npm Scripts

```bash
# Run all tests
npm test

# Run tests in specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Open Playwright UI Mode for interactive testing
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Debug tests with Playwright Inspector
npm run test:debug

# View the HTML report
npm run test:report
```

### Writing Tests

All tests should import `test` and `expect` from `@fixtures/test-base` to inherit the custom fixtures (auto-navigation, cleanup, page objects):

```typescript
import { test, expect } from '@fixtures/test-base';
import { LoginPage } from '@pages/login.page';

test('verify login page', async ({ page, loginPage }) => {
  await page.goto('/login');
  await loginPage.login('user', 'pass');
  expect(await loginPage.getErrorMessageText()).toContain('Invalid credentials');
});
```

### API Testing

Playwright's built-in `request` fixture enables HTTP API testing without a browser. API tests live in `tests/api/` and use the standard `@playwright/test` import:

```typescript
import { test, expect } from '@playwright/test';

test('GET request', async ({ request }) => {
  const response = await request.get('https://api.example.com/users');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body)).toBeTruthy();
});
```

Available request methods: `get`, `post`, `put`, `patch`, `delete`, `head`, `fetch`.

```bash
# Run only API tests
npx playwright test tests/api/

# Run API tests with a specific reporter
npx playwright test tests/api/ --reporter=line
```

### Choice A: Generate Lightweight Playwright HTML Reports

Creates a self-contained, lightweight `.html` build report folder with embedded trace files, logs, and failure videos.

```bash
npx playwright test --reporter=html

```

### Choice B: Generate Advanced Allure 3 Interactive Dashboards

Compiles a graphical dashboard detailing timelines, error trace breakdowns, nested failures, expandable screenshots, and interactive inline streaming `.webm` videos.

```bash
# 1. Run the test suite to harvest raw metadata
npx playwright test --reporter=line,allure-playwright

# 2. Compile metrics and launch a localized browser viewer server
allure serve allure-results

```

---

## Code Quality & Formatting

The project enforces consistent code style using ESLint for linting and Prettier for formatting. These checks run automatically in CI and block merges on violations.

### Linting

```bash
# Check for lint errors
npm run lint:check

# Auto-fix lint errors
npm run lint:fix
```

### Formatting

```bash
# Check formatting (read-only, fails if unformatted)
npm run format:check

# Auto-format all files
npm run format
```

### What Gets Checked

| Tool | Files | Exclusions |
|------|-------|------------|
| ESLint | `*.ts`, `*.js` | `*.md` |
| Prettier | `*.ts`, `*.js`, `*.json`, `*.yml`, `*.yaml` | `*.md`, `package-lock.json`, generated dirs |

### Pre-commit Hooks

If you have `pre-commit` installed, linting and formatting run automatically on `git commit`. Install the hooks:

```bash
pre-commit install
```

---

## Useful Playwright Command Line Flags

When executing `npx playwright test`, you can append these optional flags to control output verbosity, configuration targets, or debugging parameters:

### 1. Visual Debugging & Local Execution Controls

- `--headed`: **Disables headless mode.** Launches physical, visible browser windows on your monitor so you can watch the test execution, clicks, and transitions happen live.
- `--slow-mo <ms>`: **Introduces action delays.** Slows down all automated browser actions (clicks, inputs, navigations) by a set duration in milliseconds. Great for tracing fast visual flows (e.g., `npx playwright test --headed --slow-mo=500`).
- `--debug`: **Launches Playwright Inspector.** Opens a browser window along with the step-by-step debugger tool, allowing you to step through your script line-by-line.

### 2. Output & Configuration Controls

- `--project=<name>`: **Filter by browser target.** Runs your tests only against a specific browser configuration defined in your config (e.g., `--project=chromium` or `--project=firefox`).
- `--ui`: **Launches Playwright UI Mode.** Opens an interactive graphical interface to explore, run, view snapshots, and trace individual test steps locally.
- `--trace on-first-retry`: **Record execution traces.** Generates a complete diagnostic recording (with video, network timelines, and DOM snapshots) if a test fails on its first attempt.

### 3. Execution Control & Diagnostics

- `--max-failures=1` (or `-x`): **Stop on first failure.** Instantly terminates the entire test suite execution the moment a single test fails. Ideal for continuous integration pipelines.
- `--last-failed`: **Run only failures.** Reads execution history and re-runs only the specific tests that failed during the previous local run session.
- `-g "expression"`: **Filter by test name.** Runs tests whose titles match a keyword filter string (e.g., `npx playwright test -g "login"` runs only login-related tests).

### 4. Parallelization & Scaling

- `--workers=<num>`: **Multi-threaded execution.** Spreads tests concurrently across local machine CPU worker threads:

```bash
# Force a custom thread speed layout limit or let Playwright optimize automatically
npx playwright test --workers=50%

```

---

## Configuration Details (`playwright.config.ts`)

Global default parameters reside directly inside `playwright.config.ts` to enforce strict folder mappings, retry capabilities, execution limits, and dictate browser video retention logic:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports', open: 'never' }],
    ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://playwright.dev/',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

_Note: `video: 'retain-on-failure'` guarantees videos are safely discarded for passing tests, preserving local storage._

---

## TypeScript Configuration (`tsconfig.json`)

Path aliases enable clean imports without relative path chains:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@fixtures/*": ["fixtures/*"],
      "@pages/*": ["pages/*"],
      "@tests/*": ["tests/*"]
    }
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", "allure-results", "allure-report", "reports", "test-results"]
}
```

| Option | Value | Purpose |
|--------|-------|---------|
| `target` | `ES2022` | Modern JS output with async/await, class fields |
| `module` | `commonjs` | Node.js compatible module system |
| `strict` | `true` | Full type checking — catch nulls, anys, and edge cases |
| `esModuleInterop` | `true` | Smooth default imports from CommonJS packages |
| `paths` | `@fixtures/*`, `@pages/*`, `@tests/*` | Clean imports like `@fixtures/test-base` |

---

## Handling Intentional Failures & WIP Tests

To keep the continuous integration (CI) pipeline green while tracking unfinished features or known application bugs, use Playwright’s native test annotations:

### 1. Mark as an Expected Failure (`test.fail()`)

The cleanest engineering practice for tracking known open bugs. It instructs Playwright to expect a failure:

- If the test **fails**, the CI pipeline stays **Green (Passing)**.
- If the bug gets fixed and the test suddenly **passes**, Playwright flags it as a failure so you know to remove the annotation.

```typescript
test.fail('verify broken mobile submit action', async ({ page }) => {
  await page.goto('/login');
  await page.click('#submit-mobile'); // Assertion failure here won't break CI
});
```

### 2. Skip a Single Test Completely

Bypasses a test block entirely during execution, marking it cleanly as `Skipped` in your execution dashboards:

```typescript
test.skip('verify unfinished dashboard widget', async ({ page }) => {
  await page.goto('/dashboard');
});
```

### 3. Focus on a Single Test (`test.only`)

During local debugging, isolate an individual test. Playwright will completely bypass every other file and spec block in your repository except this one:

```typescript
test.only('debug this specific selector flow', async ({ page }) => {
  // Only this test executes locally
});
```

---

## Git Best Practices & Untracked Files

The following local runtime artifacts, secrets, and environment managers generated during execution must remain completely untracked. Ensure your local `.gitignore` configuration matches the framework blueprint:

```text
.env
*.env
test-results/
allure-results/
allure-report/
playwright-report/
blob-report/
node_modules/
dist/
.eslintcache

```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
