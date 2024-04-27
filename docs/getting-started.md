# Getting started

Currently Genji can be used in [VitePress](https://vitepress.dev/) via the custom theme: [genji-theme-vitepress](https://github.com/pearmini/genji/tree/main/packages/genji-theme-vitepress).

::: info Future Work
There are plans to develop additional Genji themes and plugins for other SSGs in the future, such as [Docusaurus](https://docusaurus.io/), [Nextra](https://nextra.site/), [Rspress](https://rspress.dev/) and more.
:::

## Try Genji online

You can try VitePress and Genji directly in your browser on [StackBlitz](https://stackblitz.com/edit/vite-p5brzc?file=package.json).

## Installing from NPM

First, you should install VitePress and create a basic project following the instructions in the [Getting Started](https://vitepress.dev/guide/getting-started) section of the VitePress official guide.

Then install `genji-theme-vitepress` from NPM:

```bash
$ npm install genji-theme-vitepress
```

To consume `genji-theme-vitpress`, override the default `Layout` component from the chosen theme:

```js
// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "genji-theme-vitepress";
import { h } from "vue";

// More props: https://genji-md.dev/reference/props
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

## With other Markdown plugins <Badge type="info" text="^0.2.1" />

If you are working with other Markdown plugins, you should register Markdown plugin _genjiAttrs_ explicitly:

```js
// .vitepress/config.js
import { genjiAttrs } from "genji-theme-vitepress/config";
import otherMarkdownPlugin from "other-markdown-plugin";

export default {
  extends: config,
  markdown: {
    config: (md) => {
      md.use(otherMarkdownPlugin);
      md.use(genjiAttrs);
    },
  },
};
```

## A quick example

If everything goes where, insert the following code snippet into one of your Markdown files, excluding `index.md`:

````md
```js eval code=false
size = Inputs.range([50, 300], { label: "size", value: 100, step: 1 });
```

```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = size + "px";
  div.style.height = "100px";
  div.style.background = "orange";
  return div;
})();
```
````

This produces:

```js eval code=false
size = Inputs.range([50, 300], { label: "size", value: 100, step: 1 });
```

```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = size + "px";
  div.style.height = "100px";
  div.style.background = "orange";
  return div;
})();
```
