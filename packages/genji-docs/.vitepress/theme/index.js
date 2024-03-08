import DefaultTheme from "vitepress/theme";
import { enhanceTheme } from "genji-theme-vitepress";
import "./custom.css";

const Theme = enhanceTheme(DefaultTheme, {});

export default {
  extends: Theme,
};
