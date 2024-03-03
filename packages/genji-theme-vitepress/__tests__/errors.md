# Error

## Simple Error

```js | dom
display(() => {
  const a = 1;
  a = 2;
});
```

```js | dom
(() => {
  const a = 1;
  a = 2;
})();
```

## Function Error

```js | dom
(() => {
  function error() {
    const a = 1;
    a = 2;
  }

  error();

  return null;
})();
```
