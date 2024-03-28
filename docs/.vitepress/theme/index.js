import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import Layout from "genji-theme-vitepress";
import { dot, barY, plot } from "@observablehq/plot";
import { json, csv } from "d3-fetch";
import { require } from "d3-require";
import { autoType } from "d3-dsv";
import { sum, groups, sort, groupSort, median } from "d3-array";
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
    d3: { json, require, csv, autoType, sum, groups, sort, groupSort, median },
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
    plot(code) {
      return `
        call(() => {
          const plot = ${code};
          unsubscribe(() => plot.remove());
          return plot;
        })
      `;
    },
  },
  Theme: DefaultTheme,
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
