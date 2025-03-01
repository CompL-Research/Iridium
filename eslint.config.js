import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser,
    },
    ignores: ["node_modules", "dist", "build", "out", ".git", "temp", "tests", "outputs", "classes/builder/IridiumHelpers/Passes/PTA-UOW"]
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig, // Disables ESLint rules that conflict with Prettier
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error", // Report formatting issues.
      semi: ["error", "always"], // Force semicolons
    },
  },
];
