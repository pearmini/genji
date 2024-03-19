import DefaultTheme from "vitepress/theme";
import Layout from "../../../src/client/Layout.vue";
import { h } from "vue";

const props = {
  library: {
    block: (color) => {
      const div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.background = color;
      return div;
    },
  },
  transform: {
    parseDiv: (code) => {
      return `(() => {
      ${code}
      return div;
    })()
  `;
    },
  },
  Theme: DefaultTheme,
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
