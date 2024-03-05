# Observable

## Basic

```js | dom
count = new Observable((observer) => {
  let count = 0;
  observer.next(count++);
  const timer = setInterval(() => observer.next(count++), 1000);
  return () => clearInterval(timer);
});
```

## Mouse

```js | dom
pointer = new Observable((observer) => {
  const pointermoved = (event) => observer.next([event.clientX, event.clientY]);
  addEventListener("pointermove", pointermoved);
  observer.next([0, 0]);
  return () => removeEventListener("pointermove", pointermoved);
});
```
