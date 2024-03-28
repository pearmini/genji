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

function p5(withDraw) {
  return (code) => `
    call(() => {
      const sketch = (p) => {
        const {
          createCanvas: _createCanvas, 
          background: _background, 
          square:_square,
          rotateY:_rotateY,
          WEBGL,
        } = p;
        const createCanvas = _createCanvas.bind(p);
        const background = _background.bind(p);
        const square = _square.bind(p);
        const rotateY = _rotateY.bind(p);
        window.frameCount = p.frameCount;
        ${code}
        p.setup = setup;
        ${
          withDraw
            ? `p.draw = () => {
                window.frameCount = p.frameCount;
                draw();
              };`
            : ""
        }
      };
      const div = document.createElement('div');
      const p = new p5(sketch, div);
      let canvas = div.firstChild;
      const canvas2 = div.lastChild;
      if (canvas2 !== canvas) {
        canvas.remove();
        canvas = canvas2;
      }
      canvas.style.visibility = 'visible';
      div.style.height = canvas.style.height;
      div.style.overflow = 'hidden';
      document.body.appendChild(div);
      unsubscribe(() => p.remove());
      return div;
    });
  `;
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
    p: p5(false),
    pp: p5(true),
  },
  Theme: DefaultTheme,
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
