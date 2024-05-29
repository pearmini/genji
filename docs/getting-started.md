# Getting started

Currently Genji can be used with [VitePress](#vitepress) and [Docusaurus](#docusaurus). There are plans to develop additional Genji themes and plugins for other SSGs in the future, such as [Nextra](https://nextra.site/), [Rspress](https://rspress.dev/) and more.

## Try Genji online

You can try Genji directly in your browser on StackBlitz:

- [VitePress](https://stackblitz.com/edit/vite-p5brzc?file=package.json)
- [Docusaurus](https://stackblitz.com/edit/vite-p5brzc?file=package.json)

## Genji in VitePress

In [VitePress](https://vitepress.dev/), Genji can be used via the custom theme: [genji-theme-vitepress](https://github.com/pearmini/genji/tree/main/packages/genji-theme-vitepress).

### Installing VitePress from NPM

First, you should install VitePress and create a basic project following the instructions in the [Getting Started](https://vitepress.dev/guide/getting-started) section of the VitePress official guide.

Then install `genji-theme-vitepress` from NPM:

```bash
$ npm install genji-theme-vitepress -D
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

### With other Markdown plugins <VersionBadge version="0.2.1"/> {#with-other-markdown-plugins}

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

Then you can test with this [example](#a-quick-example).

## Genji in Docusaurus

In [Docusaurus](https://docusaurus.io/), Genji can be used via the custom theme: [genji-theme-docusaurus](https://github.com/pearmini/genji/tree/main/packages/genji-theme-docusaurus).

### Installing Docusaurus from NPM

First, you should install Docusaurus and create a basic project following the instructions in the [Installation](https://docusaurus.io/docs/installation) section of the VitePress official guide.

Then install `genji-theme-docusaurus` from NPM:

```bash
$ npm install genji-theme-docusaurus -D
```

After that register `genji-theme-docusaurus` in _docusaurus.config.js_ via plugins option:

```js
// docusaurus.config.js
const config = {
  // ...
  plugins: ["genji-theme-docusaurus"],
  // ...
};
```

And create a `genji.config.js` in the root directory to configure genji:

```js
// genji.config.js
import { defineConfig } from "genji-theme-docusaurus/config";

// More props: https://genji-md.dev/reference/props
export default defineConfig({});
```

Then you can test with this [example](#a-quick-example).

## A quick example

If everything goes where, insert the following code snippet into one of your Markdown files.

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
