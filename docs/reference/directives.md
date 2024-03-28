# Directives

Options for code blocks, in the format of:

````md
```lang d d1 d2 ...
// code
```
````

## eval

Wether to evaluate the code block or not; defaults to _false_.

````md
```js eval
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "black";
  return div;
});
```
````

This produces:

```js eval
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "black";
  return div;
});
```

## code

Wether to show the code block or not; defaults to _true_.

````md
```js eval code=false
size = Inputs.range([0, 300], { label: "size", value: 100, step: 1 });
```
````

This produces:

```js eval code=false
size = Inputs.range([0, 300], { label: "size", value: 100, step: 1 });
```

## Inspector

Wether to show the evaluated results or not; defaults to _true_.

````md
```js eval code=false inspector=false
function add(x, y) {
  return x + y;
}
```

```js eval
add(1, 2);
```
````

This produces:

```js eval code=false inspector=false
function add(x, y) {
  return x + y;
}
```

```js eval
add(1, 2);
```

## overflow

Sets the _style.overflow_ of the container which displays the render result of the specified code block; defaults to _auto_, any of _visible_, _hidden_, _clip_, _scroll_.

````md
```js eval overflow=visible
call(() => {
  const div = document.createElement("div");
  div.style.width = width + 40 + "px";
  div.style.height = "40px";
  div.style.background = "black";
  return div;
});
```
````

This produces:

```js eval overflow=visible
call(() => {
  const div = document.createElement("div");
  div.style.width = width + 40 + "px";
  div.style.height = "40px";
  div.style.background = "black";
  return div;
});
```

## t

Specifies [transforms](/features/transforms).

````md
```py t=py
# ...
```
````

Multiple transforms can be specified splitting by `,`:

````md
```js t=ts,esm
// ...
```
````

The definitions of transforms should be declared in [_props.transform_](/reference/props#transform).
