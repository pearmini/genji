# Props

Props for the _Layout_ component from `genji-theme-vitpress`.

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

## library

Specifies custom global variables and functions can be accessed in code blocks. For example, to use [@observablehq/plot](https://observablehq.com/plot/) and a custom block function:

```bash
$ npm i @observablehq/plot
```

```js
// .vitepress/theme/index.js
import * as Plot from "@observablehq/plot";

function block(color) {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = color;
  return div;
}

const props = {
  library: {
    Plot,
    block,
  },
};
```

Genji assigns the specified _library_ to _window_, allowing you access _Plot_ and _block_ directly:

```js eval
Plot.barY(
  [
    { genre: "Sports", sold: 275 },
    { genre: "Strategy", sold: 115 },
    { genre: "Action", sold: 120 },
    { genre: "Shooter", sold: 350 },
    { genre: "Other", sold: 150 },
  ],
  { x: "genre", y: "sold" }
).plot();
```

```js eval
block("steelblue");
```

## transform

Specifies the transforms to transform code in code blocks before executing. For example, to define a transform called _py_:

```js
// .vitepress/theme/index.js
import * as Plot from "@observablehq/plot";

function block(color) {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = color;
  return div;
}

const props = {
  transform: {
    py(code) {
      return code.replace("print", "new Array");
    },
  },
};
```

Then set _t_ directive of the code block to _py_:

````md
```py eval t=py
print([1, 2, 3])
```
````

This produces:

```py eval t=py
print([1, 2, 3])
```

## Theme

Specifies the _Theme_ component to extends the Genji Markdown extension. In most of situations, you should extend the _DefaultTheme_ of VitePress:

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

It is also possible to extend other VitePress theme:

```js
// .vitepress/theme/index.js
import CustomTheme from "custom-vitepess-theme";
import Layout from "genji-theme-vitepress";
import { h } from "vue";

const props = {
  Theme: CustomTheme,
};

export default {
  extends: CustomTheme,
  Layout: () => h(Layout, props),
};
```
