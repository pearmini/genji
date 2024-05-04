import { defineConfig } from "genji-theme-docusaurus/config";

export default defineConfig({
  library: {
    block: (color) => {
      const div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.background = color;
      return div;
    },
  },
});
