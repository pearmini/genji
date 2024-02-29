# Genji Markdown Extensions

Test Genji' built-in Markdown Extensions.

## Basic Block

It should render a red block.

```js
display(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "red";
  return div;
});
```
