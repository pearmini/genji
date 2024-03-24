import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import Layout from "genji-theme-vitepress";
import { dot, barY, plot } from "@observablehq/plot";
import { json } from "d3-fetch";
// import { app, range, circle, random, rgb } from "@charming-art/charming";
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
    cm: {
      // app, range, circle, random, rgb
    },
    block,
  },
  transform: {
    py(code) {
      return code.replace("print", "new Array");
    },
    cm(code) {
      return `
        call(() => {
          const app = cm.app({ width: 600, height: 200});
    
          ${code}
        
          function dispose(app) {
            unsubscribe(() => app.dispose());
          }

          function border(app) {
            app.node().style.border = "solid #000 1px";
          }
    
          return app.call(dispose).call(border).render().node();
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
