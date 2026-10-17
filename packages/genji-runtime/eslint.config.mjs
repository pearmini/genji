import js from "@eslint/js";
import prettier from "eslint-config-prettier";

const globals = {
  cancelAnimationFrame: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  CustomEvent: "readonly",
  document: "readonly",
  Event: "readonly",
  EventTarget: "readonly",
  HTMLElement: "readonly",
  module: "readonly",
  NodeFilter: "readonly",
  process: "readonly",
  requestAnimationFrame: "readonly",
  ResizeObserver: "readonly",
  setTimeout: "readonly",
  SVGElement: "readonly",
  URL: "readonly",
  window: "readonly",
};

export default [
  js.configs.recommended,
  prettier,
  {
    files: ["src/**/*.js", "test/**/*.js"],
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
