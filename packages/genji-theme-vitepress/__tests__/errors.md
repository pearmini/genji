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

## Observable Error

```js eval
new Observable((observer) => {
  const a = 1;
  a = 2;
});
```
