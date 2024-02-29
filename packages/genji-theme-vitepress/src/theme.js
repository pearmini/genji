import { h } from "vue";
import Layout from "./Layout.vue";
import "./style.css";

export function enhanceTheme(Theme, { global } = {}) {
  return {
    extends: Theme,
    Layout: () => {
      return h(Layout, { global, Theme });
    },
  };
}
