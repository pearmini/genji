import DefaultTheme from "vitepress/theme";
import { enhanceTheme } from "../../../src/client";

const Theme = enhanceTheme(DefaultTheme, {
  global: {
    block: (color) => {
      const div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.background = color;
      return div;
    },
    parseDiv: (code) => {
      return `(() => {
          ${code}
          return div;
        })()
      `;
    },
  },
});

export default {
  extends: Theme,
};
