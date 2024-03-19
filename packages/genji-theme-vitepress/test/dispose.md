# Dispose

## unsubscribe

```js eval
call(() => {
  const span = document.createElement("span");
  span.textContent = 1;

  const timer = setInterval(() => (span.textContent = +span.textContent + 1), 1000);

  unsubscribe(() => {
    clearInterval(timer);
    alert("Dispose Block");
  });

  return span;
});
```

## Error

```js eval
call(() => {
  const span = document.createElement("span");
  span.textContent = 1;

  const timer = setInterval(() => (span.textContent = +span.textContent + 1), 1000);

  unsubscribe(() => {
    clearInterval(timer);
    al("Dispose Block");
  });

  return span;
});
```

## Signal

```js eval
count = Signals.define((next) => {
  let count = 0;
  next(count++);
  const timer = setInterval(() => next(count++), 1000);
  return () => {
    clearInterval(timer);
    alert("Dispose Signal");
  };
});
```
