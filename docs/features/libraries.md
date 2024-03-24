# Libraries

**Libraries** are collections of variables or functions can be accessed in code blocks.

## Built-in libraries

Genji provides some out-of-the-box libraries, such as [Globals](/reference/globals), [Inputs](/reference/inputs) and [Signals](/reference/signals). You can access them directly in any code blocks. For example, to define a [range input](/reference/inputs#range):

```js eval
number = Inputs.range([0, 100], { value: 30, label: "number" });
```

## Custom libraries

You can also register some custom libraries through [props.library](/reference/props#library), especially when you are writing documentation for some JavaScript libraries.

For example, to use [@observablehq/plot](https://observablehq.com/plot/):

```bash
$ npm i @observablehq/plot
```

Then registers it in the theme:

```js
// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "genji-theme-vitepress";
import { h } from "vue";

// Imports Plot.
import * as Plot from "@observablehq/plot";

const props = {
  library: {
    Plot, // Add Plot to custom libraries.
  },
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
```

Now you can plot a chart using it:

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

## Custom Helpers

You can also register some helper functions or variables. For example, to define a _block_ function:

```js
// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "genji-theme-vitepress";
import { h } from "vue";

const props = {
  library: {
    block(color) {
      const div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.background = color;
      return div;
    },
  },
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
```

Then:

```js eval
block("black");
```
