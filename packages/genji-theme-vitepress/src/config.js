import { defineConfig } from "vitepress";
import { attrs } from "./attrs";

export const config = defineConfig({
  markdown: {
    config: (md) => {
      md.use(attrs);
    },
  },
});
