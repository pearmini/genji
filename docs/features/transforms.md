# Transforms

**Transforms** are functions that transform code in code blocks before evaluating. It can be used to make non-JavaScript code block executable or hide parts of code which are unnecessary to display.

Transforms are specified via `t` [directive](/reference/directives):

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

Typically, only JavaScript code blocks can be executed directly, but you can use transforms to transform the non-JavaScript code into executable JavaScript code, such as [TypeScript](https://www.typescriptlang.org/), [Vue](https://vuejs.org/), [React](https://react.dev/), [Python](https://www.python.org/), and more.

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

For example, to hide the creating and returning statements when manipulating a div element:

````md
```js eval
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "red";
  return div;
});
```
````

With the `div` function is defined:

```js
function div(code) {
  return `
    call(() => {
      const div = document.createElement('div')
      ${code}
      return div;
    });
  `;
}
```

Now say:

````md
```js eval t=div
div.style.width = "100px";
div.style.height = "100px";
div.style.background = "red";
```
````

This produces:

```js eval t=div
div.style.width = "100px";
div.style.height = "100px";
div.style.background = "red";
```
