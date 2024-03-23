import { defineConfig } from "vitepress";
import config from "genji-theme-vitepress/config";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: config,
  title: "Genji",
  description: "The Interactive Markdown extension",
  cleanUrls: true,
  head: [["link", { rel: "icon", type: "image/png", href: "/icon.png" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/getting-started" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is Genji?", link: "/what-is-genji" },
          { text: "Why Genji?", link: "/why-genji" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
      {
        text: "Features",
        items: [
          { text: "Code Blocks", link: "/features/code-blocks" },
          { text: "Libraries", link: "/features/libraries" },
          { text: "Inputs", link: "/features/inputs" },
          { text: "Signals", link: "/features/signals" },
          { text: "Transforms", link: "/features/transforms" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Directives", link: "/reference/directives" },
          { text: "Globals", link: "/reference/globals" },
          { text: "Inputs", link: "/reference/inputs" },
          { text: "Props", link: "/reference/props" },
        ],
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Bairui SU",
    },
    logo: "/logo.svg",
    socialLinks: [
      { icon: "github", link: "https://github.com/pearmini/genji" },
    ],
  },
});
