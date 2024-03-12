import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import Layout from "genji-theme-vitepress";
import "./custom.css";

const props = {
  global: {},
  Theme: DefaultTheme,
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
