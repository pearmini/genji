# Promise Cell

## Promise

```js | dom
new Promise((resolve) => {
  setTimeout(() => resolve(block("orange")), 3000);
});
```

## Async Function

```js | dom
(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
  return block("orange");
})();
```

```js | dom
display(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
  return block("orange");
});
```
