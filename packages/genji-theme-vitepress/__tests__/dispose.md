# Dispose

## unsubscribe

```js eval
display(() => {
  const span = document.createElement("span");
  span.textContent = 1;

  const timer = setInterval(
    () => (span.textContent = +span.textContent + 1),
    1000
  );

  unsubscribe(() => {
    clearInterval(timer);
    alert("Dispose Block");
  });

  return span;
});
```

## Error

```js eval
display(() => {
  const span = document.createElement("span");
  span.textContent = 1;

  const timer = setInterval(
    () => (span.textContent = +span.textContent + 1),
    1000
  );

  unsubscribe(() => {
    clearInterval(timer);
    al("Dispose Block");
  });

  return span;
});
```
