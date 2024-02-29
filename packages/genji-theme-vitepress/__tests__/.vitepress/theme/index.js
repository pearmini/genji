import DefaultTheme from "vitepress/theme";
import { enhanceTheme } from "../../../src";

function display(fn) {
  return fn();
}

const Theme = enhanceTheme(DefaultTheme, {
  global: { display },
});

export default {
  extends: Theme,
};
