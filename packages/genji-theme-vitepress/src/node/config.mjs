import { defineConfig } from "vitepress";
import { attrs } from "./attrs.mjs";

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(attrs);
    },
  },
});
