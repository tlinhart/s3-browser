const eslint = require("@eslint/js");
const { fixupPluginRules } = require("@eslint/compat");
const globals = require("globals");
const babelParser = require("@babel/eslint-parser");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const jest = require("eslint-plugin-jest");
const jestDom = require("eslint-plugin-jest-dom");
const testingLibrary = require("eslint-plugin-testing-library");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  eslint.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        APP_NAME: "readonly",
        APP_VERSION: "readonly",
      },
      parser: babelParser,
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.test.{js,jsx}"],
    ...jest.configs["flat/recommended"],
    ...jestDom.configs["flat/recommended"],
    plugins: {
      "testing-library": fixupPluginRules({ rules: testingLibrary.rules }),
    },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },
];
