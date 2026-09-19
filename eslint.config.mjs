import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['*.md'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts', 'fixtures/**/*.ts'],
  },
  {
    // Setup files bootstrap state (env checks, login); they legitimately
    // contain conditionals and need no web-first assertions.
    files: ['tests/**/*.setup.ts'],
    rules: {
      'playwright/expect-expect': 'off',
      'playwright/no-conditional-in-test': 'off',
    },
  },
  {
    // Debug leftovers should not survive a commit; warn/error are fine
    // (they end up in report attachments).
    files: ['**/*.ts'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  eslintConfigPrettier // Disables rule conflicts with Prettier format patterns
);
