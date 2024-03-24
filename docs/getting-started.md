# Getting started

Currently Genji can be used in [VitePress](https://vitepress.dev/) via the custom theme: genji-theme-vitepress. And there are plans to develop additional Genji themes and plugins for other SSGs in the future, such as [Docusaurus](https://docusaurus.io/), [Nextra](https://nextra.site/), [Rspress](https://rspress.dev/) and more.

## Try It Online

You can try VitePress and Genji directly in your browser on [StackBlitz](https://stackblitz.com/edit/vite-p5brzc?file=package.json).

## Installing

First, you should install VitePress and create a basic project following the instructions in the [Getting Started](https://vitepress.dev/guide/getting-started) section of the VitePress official guide. Then install `genji-theme-vitepress` from NPM:

```bash
$ npm install genji-theme-vitepress
```

To consume `genji-theme-vitpress`, override the default `Layout` component from the chosen theme:

```js
// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "genji-theme-vitepress";
import { h } from "vue";

const props = {
  Theme: DefaultTheme,
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
```

Genji also requires special VitePress config, extend it in the config:

```js
// .vitepress/config.js
import config from "genji-theme-vitepress/config";

export default {
  extends: config,
};
```

If everything goes where, insert the following code snippet into one of your Markdown files, excluding `index.md`:

````md
```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "steelblue";
  return div;
})();
```
````

This produces:

```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "steelblue";
  return div;
})();
```
