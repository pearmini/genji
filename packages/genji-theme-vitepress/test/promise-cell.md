# Promise Cell

## Promise

```js eval
new Promise((resolve) => {});
```

## Async Function

```js eval
(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
  return block("orange");
})();
```

```js eval
call(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
  return block("orange");
});
```
