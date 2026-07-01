import js from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
  },
  eslintConfigPrettier // Disables rule conflicts with Prettier format patterns
);
