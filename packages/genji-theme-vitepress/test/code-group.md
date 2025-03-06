# Code Group

```js eval
text("hello");
```

::: code-group hello

```js [main.js] eval
text("world");
```

```js [utils.js] eval
function text(text) {
  return document.createTextNode(text);
}
```

:::

::: code-group hello

```js [main.js] eval
text2("!");
```

```js [utils.js] eval inspector=false
function text2(text) {
  return document.createTextNode(text);
}
```

:::
