import { defineConfig } from "vitepress";
import { genjiPlugin } from "./genji";

export const config = defineConfig({
  markdown: {
    config: (md) => {
      md.use(genjiPlugin);
    },
  },
});
