# Code Group

```js eval
text("hello");
```

::: code-group

```js [main.js] eval
text("world");
```

```js [utils.js] eval
function text(text) {
  return document.createTextNode(text);
}
```

:::

::: code-group

```js [main.js] eval
text2("!");
```

```js [utils.js] eval inspector=false
function text2(text) {
  return document.createTextNode(text);
}
```

:::

## Tabs

This should not recount when switching between tabs.

::: code-group

```js [main.js] eval
countdown();
```

```js [utils.js] eval inspector=false
function countdown() {
  const node = document.createTextNode(text);
  node.textContent = width;
  setInterval(() => (node.textContent = +node.textContent - 1), 1000);
  return node;
}
```

:::
