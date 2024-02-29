import { h } from "vue";
import Layout from "./Layout.vue";
import DefaultTheme from "vitepress/theme";
import "./style.css";

export function createTheme({ global } = {}) {
  return {
    extends: DefaultTheme,
    Layout: () => {
      return h(Layout, { global });
    },
  };
}
