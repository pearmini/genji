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
          }),
        ],
      },
    },
    optimizeDeps: {
      include: ["genji-theme-vitepress > esprima", "genji-theme-vitepress > estraverse"],
    },
  },
});
