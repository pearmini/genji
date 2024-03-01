# Genji Markdown Extensions

Test Genji' built-in Markdown Extensions.

## Pure Block

It should not render without `| dom` markup with `js`.

```js
display(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "red";
  return div;
});
```

## Renderable Block

It should render with `| dom` markup with `js`.

```js | dom {0,4}
display(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "red";
  return div;
});
```

## JavaScript Block

It should render with `| dom` markup with `javascript`.

```javascript | dom
display(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "red";
  return div;
});
```

## Python Block

It should not render python block.

```python
def add(x, y):
  return x + y
```

## Python Block2

It should not render python block with `| dom` markup.

```python | dom
def add(x, y):
  return x + y
```
