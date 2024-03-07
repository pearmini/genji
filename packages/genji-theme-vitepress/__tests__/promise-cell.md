# Promise Cell

## Promise

```js eval
new Promise((resolve) => {
  setTimeout(() => resolve(block("orange")), 3000);
});
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
display(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
  return block("orange");
});
```
