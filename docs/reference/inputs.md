# Inputs

Reactive inputs, adapted from [@observablehq/inputs](https://github.com/observablehq/inputs).

::: tip Want More?
Currently Genji only exports a subset of inputs in @observablehq/inputs, you can open a PR if you want more.
:::

## fromElement(_element_) {#fromElement}

Returns a input that produce new value whenever the given _element_ emits an _input_ event, with the given element’s current _value_.

```js eval
custom = Inputs.fromElement(document.createElement("input"));
```

```js eval
`custom is ${custom}.`;
```

## button(_content[, options]_) {#button}

Returns a button input. For more information, refer to the [@observablehq/inputs#button](https://github.com/observablehq/inputs?tab=readme-ov-file#button) documentation.

```js eval
count = Inputs.button("Add", {
  value: 1,
  reduce: (value) => value + 1,
});
```

```js eval
call(() => {
  const div = document.createElement("div");
  const span = () => `
    <span style="
      display:inline-block;
      width: 10px;
      height: 30px;
      background: black;
    ">
    </span>`;
  div.innerHTML = Array.from({ length: count }, span).join("");
  return div;
});
```

## color(_options_) {#color}

Returns a color input. For more information, refer to the [@observablehq/inputs#color](https://github.com/observablehq/inputs?tab=readme-ov-file#inputscoloroptions) documentation.

```js eval
fill = Inputs.color({ label: "fill", value: "#000" });
```

```js eval
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = fill;
  return div;
});
```

## range(_extent[, options]_) {#range}

Returns a range input. For more information, refer to the [@observablehq/inputs#range](https://github.com/observablehq/inputs?tab=readme-ov-file#range) documentation.

```js eval
size = Inputs.range([0, 300], { label: "size", value: 100, step: 1 });
```

```js eval
call(() => {
  const div = document.createElement("div");
  div.style.width = size + "px";
  div.style.height = "100px";
  div.style.background = "black";
  return div;
});
```

## select(_data[, options]_) {#select}

Returns a select input. For more information, refer to the [@observablehq/inputs#select](https://github.com/observablehq/inputs?tab=readme-ov-file#select) documentation.

```js eval
type = Inputs.select(["S", "M", "L"], { label: "type" });
```

```js eval
call(() => {
  const div = document.createElement("div");
  const size = type === "S" ? 50 : type === "M" ? 100 : 150;
  div.style.width = size + "px";
  div.style.height = size + "px";
  div.style.background = "black";
  return div;
});
```

## table(_data[, options]_) {#table}

Returns a table input. For more information, refer to the [@observablehq/inputs#table](https://github.com/observablehq/inputs?tab=readme-ov-file#table) documentation.

```js eval
data = Inputs.table([
  { genre: "Sports", sold: 275 },
  { genre: "Strategy", sold: 115 },
  { genre: "Action", sold: 120 },
  { genre: "Shooter", sold: 350 },
  { genre: "Other", sold: 150 },
]);
```

```js eval
data;
```

## text(_options_) {#text}

Returns a text input. For more information, refer to the [@observablehq/inputs#text](https://github.com/observablehq/inputs?tab=readme-ov-file#text) documentation.

```js eval
name = Inputs.text({ label: "Name", placeholder: "Enter your name" });
```

```js eval
`You name is ${name}.`;
```
