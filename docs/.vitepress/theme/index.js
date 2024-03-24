import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import Layout from "genji-theme-vitepress";
import { dot, barY, plot } from "@observablehq/plot";
import { json } from "d3-fetch";
import "./custom.css";

function block(color) {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = color;
  return div;
}

const props = {
  library: {
    d3: { json },
    Plot: { dot, barY, plot },
    block,
  },
  transform: {
    py(code) {
      return code.replace("print", "new Array");
    },
    div(code) {
      return `
        call(() => {
          const div = document.createElement('div')
          ${code}
          return div;
        });
      `;
    },
  },
  Theme: DefaultTheme,
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
