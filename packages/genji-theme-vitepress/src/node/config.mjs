import { defineConfig, postcssIsolateStyles } from "vitepress";
import { attrs } from "./attrs.mjs";

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(attrs);
    },
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          postcssIsolateStyles({
            includeFiles: [/vp-doc\.css/, /base\.css/],
            prefix: ":not(:where(.genji-cell, .genji-cell *))",
          }),
        ],
      },
    },
    optimizeDeps: {
      include: [
        "genji-theme-vitepress > genji-runtime > esprima",
        "genji-theme-vitepress > genji-runtime > estraverse",
      ],
    },
  },
});

export const genjiAttrs = attrs;
