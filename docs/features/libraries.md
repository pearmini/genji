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

:::tip
For [Observable Notebook](https://observablehq.com) users, you could install and register [@observablehq/stdlib](https://github.com/observablehq/stdlib) for better writing experiences.
:::

## Custom helpers

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

## Dynamic libraries

If you don't want to import your libraries at build time, you can use [d3-require](https://github.com/d3/d3-require/tree/main) to import them at runtime, which can help you reduce bundle size of the website.

For example, to use [Jquery](https://jquery.com/) dynamically:

```bash
$ npm i d3-require
```

Then registers _d3-require_ in the theme:

```js
// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "genji-theme-vitepress";
import { h } from "vue";

// Imports d3-require
import { require } from "d3-require";

const props = {
  library: {
    d3: { require },
  },
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
```

Require _Jquery_ and assign it to the variable _$_:

```js eval
$ = d3.require("jquery");
```

```js eval
$("<div></div>").width(100).height(100).css("background", "orange").get(0);
```

Refer to _d3-require_'s [documentation](https://github.com/d3/d3-require/tree/main) for more information.
