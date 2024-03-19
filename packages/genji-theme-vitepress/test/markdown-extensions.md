# Markdown Extensions

Test Genji' built-in Markdown Extensions.

## Pure Block

It should not render without `eval` markup with `js`.

```js
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "red";
  return div;
});
```

## Renderable Block

It should render with `eval` markup with `js`.

```js eval {0,4}
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "red";
  return div;
});
```

## JavaScript Block

It should render with `eval` markup with `javascript`.

```javascript eval
block("orange");
```

## Hide Code

```js eval code=false
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "steelblue";
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

It should throw error when rendering python block with `eval` markup.

```python eval
def add(x, y):
  return x + y
```
