# Code Blocks

In Genji each fenced code block marked with `eval` directive, typically JavaScript code block(_\`\`\`js eval_), is executable. These code blocks are supposed to have only one _statement_ or _expression_. The evaluated result of executing a code block will be inspected and displayed in the document.

````md
```js eval
1 + 1;
```
````

This produces:

```js eval
1 + 1;
```

If an expression evaluates to a DOM node, the node is displayed as-is.

````md
```js eval
document.createTextNode("Hello, world!");
```
````

This produces:

```js eval
document.createTextNode("Hello, world!");
```

Code blocks in one page are not independent and can reference each other. It can be synchronous or asynchronous, and once its value has changed, the outputs of code blocks reference it will rerender. There is no need to arrange code blocks explicitly because code runs in topological rather than top-down document order.

````md
```js eval
add(1, 2);
```

```js eval
const add = (a, b) => a + b;
```
````

This produces:

```js eval
add(1, 2);
```

```js eval
const add = (a, b) => a + b;
```

## Variables

The following ways of declaring a variable have no difference, but the first one is recommended for brevity.

````md
```js eval
a = 1;
```

```js eval
let a = 1;
```

```js eval
var a = 1;
```

```js eval
const a = 1;
```
````

The first one produces:

```js eval
a = 1;
```

## Functions

Both synchronous function and asynchronous function can be declared:

````md
```js eval
// Declare a synchronous function.
function add(x, y) {
  return x + y;
}
```

```js eval
// Declare a asynchronous function.
async function delay(ms) {
  await new Promise((resolve) => setTimeout(ms, resolve));
}
```
````

Instead of calling a defined function, you can wrap complex code block into IIFE (immediately-invoked function expression) to satisfy the "one expression" constrain:

````md
```js
// Call a defined function
add(1, 1);
```

```js eval
// Call a synchronous IIFE.
// This is useful for complex code block.
(() => {
  const div = document.createElement("div");
  div.innerText = "Hello World";
  div.style.background = "red";
  return div;
})();
```

```js eval
// Call a asynchronous IIFE.
(async () => {
  const text = await new Promise((resolve) =>
    setTimeout(() => resolve("hello"), 3000)
  );
  const div = document.createElement("div");
  div.innerText = "hello";
  div.style.background = "red";
  return div;
})();
```
````

The second one produces:

```js eval
(() => {
  const div = document.createElement("div");
  div.innerText = "Hello World";
  div.style.background = "orange";
  return div;
})();
```

You can also invoke the global _call(callback)_ function to simplify IIFE expression:

```js eval
call(() => {
  const div = document.createElement("div");
  div.innerText = "Hello World";
  div.style.background = "orange";
  return div;
});
```

## Promises

When a code block refers to a promise defined in another code block, the referencing code block implicitly awaits the promise and sees its resolved value.

```js eval code=false
run = Inputs.button("run", { label: "Click me" });
```

```js eval
wait = new Promise((resolve) => {
  run;
  setTimeout(() => resolve("Wait"), 1000);
});
```

```js eval
`The wait is ${wait}.`;
```

## Directives

Directives are options for code blocks, in the format of:

````md
```lang d d1 d2 ...
// ...
```
````

Except for _eval_, there are other directives to config the code block. For example, to hide the code block with `code=false` directive:

````md
```js eval code=false
1 + 1;
```
````

This produces:

```js eval code=false
1 + 1;
```

Refers to [directives reference](/reference/directives) for more details.

## Unsubscribe

While a code block can run multiple times, if you need to "clear" a code block, say to cancel an animation loop or close a socket, you should register a disposal hook for the given code block by _unsubscribe(hook)_, which will be called before the code block is re-run.

```js eval code=false
reset = Inputs.button("Reset", { label: "click me" });
```

```js eval
call(() => {
  reset;
  const span = document.createElement("span");
  span.textContent = 0;
  const counting = () => (span.textContent = +span.textContent + 1);
  const timer = setInterval(counting, 1000);
  unsubscribe(() => clearInterval(timer));
  return span;
});
```

## Code Groups

In Vitepress, you can group multiple [code blocks](https://vitepress.dev/guide/markdown#code-groups) like this:

````md
::: code-group

```js [main.js] eval
(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = rgb(100);
})();
```

```js [rgb.js] eval inspector=false
function rbg(r, g = r, b = r) {
  return `rgb(${r}, ${g}, ${b})`;
}
```

:::
````

This produce:

::: code-group

```js [main.js] eval
(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = rgb(100);
  div.style.borderRadius = "50px";
  return div;
})();
```

```js [rgb.js] eval inspector=false
function rgb(r, g = r, b = r) {
  return `rgb(${r}, ${g}, ${b})`;
}
```

:::
