import { defineConfig } from "vitepress";
import config from "genji-theme-vitepress/config";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: config,
  title: "Genji",
  description: "The Interactive Markdown extension",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Guide", link: "/markdown-examples" },
      { text: "Reference", link: "/api-examples" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],
    logo: "/logo.png",
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
