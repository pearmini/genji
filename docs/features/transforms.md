# Transforms

**Transforms** are functions that transform code in code blocks before evaluating. It can be used to make non-JavaScript code block executable or hide parts of code which are unnecessary to display.

Transforms are specified via `t` [directive](/features/directive):

````md
```py t=y
# ...
```
````

Multiple transforms can be specified splitting by `,`:

````md
```js t=ts,esm
// ...
```
````

Transforms should be registered through [_props.transform_](/reference/props#trasnform) before being declared in directive.

```js
// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "genji-theme-vitepress";
import { h } from "vue";

const props = {
  transform: {
    // Register a py transform
    py(code) {
      // ...
      return newCode;
    },
  },
};

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout, props),
};
```

## Transform Code

Typically, only JavaScript code blocks can be executed directly, but you can use transforms to transform the non-JavaScript code into executable JavaScript code, such as TypeScript, Vue, React, Python, and more.

For example, to execute the Python print function by employing a predefined _py_ transform:

```js
function py(code) {
  return code.replace("print", "new Array");
}
```

Mark the Python code block with `t=py` to specify the `py` transform:

````md
```py eval t=py
print(1, 2)
```
````

This produces:

```py eval t=py
print(1, 2)
```

## Hide Code

The other usage of transform is to hide certain parts of the code that you don't want to display.

For example, to hide setup and teardown operations when using [Charming](https://github.com/charming-art/charming):

````md
```js eval
call(() => {
  const app = cm.app({ width: 600, height: 200 });

  app.data(cm.range(10)).append(cm.circle, {
    x: () => cm.random(0, app.prop("width")),
    y: () => cm.random(0, app.prop("height")),
    r: 50,
    fill: "black",
  });

  function dispose(app) {
    unsubscribe(() => app.dispose());
  }

  function border(app) {
    app.node().style.border = "solid #000 1px";
  }

  return app.call(dispose).call(border).render().node();
});
```
````

With the `cm` function is defined:

```js
function cm(code) {
  return `
    call(() => {
      const app = cm.app({ width: 600, height: 200 });

      ${code}
    
      function dispose(app) {
        unsubscribe(() => app.dispose());
      }

      function border(app) {
        app.node().style.border = "solid #000 1px";
      }

      return app.call(dispose).call(border).render().node();
    })
  `;
}
```

Now say:

````md
```js eval t=cm
app.data(cm.range(100)).append(cm.circle, {
  x: () => cm.random(app.prop("width")),
  y: () => cm.random(app.prop("height")),
  fill: "rgba(175, 175, 175, 0.5)",
  stroke: cm.rgb(0),
  r: 16,
});
```
````

This produces:

```js eval t=cm
app.data(cm.range(100)).append(cm.circle, {
  x: () => cm.random(app.prop("width")),
  y: () => cm.random(app.prop("height")),
  fill: "rgba(175, 175, 175, 0.5)",
  stroke: cm.rgb(0),
  r: 16,
});
```
