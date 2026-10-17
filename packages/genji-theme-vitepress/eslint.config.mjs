import js from "@eslint/js";
import prettier from "eslint-config-prettier";

const globals = {
  clearTimeout: "readonly",
  console: "readonly",
  document: "readonly",
  Event: "readonly",
  EventTarget: "readonly",
  HTMLElement: "readonly",
  location: "readonly",
  module: "readonly",
  process: "readonly",
  setTimeout: "readonly",
  URL: "readonly",
  window: "readonly",
};

export default [
  {
    ignores: ["test/.vitepress/cache/**", "test/.vitepress/dist/**"],
  },
  js.configs.recommended,
  prettier,
  {
    files: ["src/**/*.js", "src/**/*.mjs", "test/**/*.js", "test/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals,
    },
    rules: {
      "no-constant-condition": "off",
      "no-dupe-keys": "off",
    },
  },
];
