import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "**/*.d.ts"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
