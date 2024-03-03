import { defineConfig } from "vitepress";
import { config } from "../../src/config";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: config,
  title: "Genji Theme VitePress",
  description: "A VitePress Site",
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Tests", link: "/markdown-extensions" },
    ],
    sidebar: [
      {
        text: "Tests",
        items: [
          { text: "Markdown Extensions", link: "/markdown-extensions" },
          { text: "Object Inspector", link: "/object-inspector" },
          { text: "Errors", link: "/errors" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
