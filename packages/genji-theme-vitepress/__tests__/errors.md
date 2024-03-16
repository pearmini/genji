# Error

## Simple Error

```js eval
display(() => {
  const a = 1;
  a = 2;
});
```

```js eval
(() => {
  const a = 1;
  a = 2;
})();
```

## Function Error

```js eval
(() => {
  function error() {
    const a = 1;
    a = 2;
  }

  error();

  return null;
})();
```

## Promise Error

```js eval
new Promise((resolve) => {
  const a = 1;
  a = 2;
});
```

## Signal Error

```js eval
new Signal((next) => {
  const a = 1;
  a = 2;
});
```

## Duplicate Error

```js eval
const a = 1;
```

```js eval
a = 2;
```

```js eval
a1 = 1;
```

```js eval
a1;
```

## Circular Reference

```js eval
function c() {
  d();
}
```

```js eval
function d() {
  c();
}
```

```js eval
c();
```
