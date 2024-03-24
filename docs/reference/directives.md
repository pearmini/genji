# Directives

Options for code blocks, in the format of:

````md
```lang d d1 d2 ...
// code
```
````

## eval

Wether to evaluate the code block or not; defaults to false.

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

Wether to hide the code block or not; defaults to false.

````md
```js eval code=false
size = Inputs.range([0, 300], { label: "size", value: 100, step: 1 });
```
````

This produces:

```js eval code=false
size = Inputs.range([0, 300], { label: "size", value: 100, step: 1 });
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
