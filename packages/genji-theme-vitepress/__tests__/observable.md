# Observable

## Basic

```js eval
count = new Observable((observer) => {
  let count = 0;
  observer.next(count++);
  const timer = setInterval(() => observer.next(count++), 1000);
  return () => clearInterval(timer);
});
```

## Mouse

```js eval
pointer = new Observable((observer) => {
  const pointermoved = (event) => observer.next([event.clientX, event.clientY]);
  addEventListener("pointermove", pointermoved);
  observer.next([0, 0]);
  return () => removeEventListener("pointermove", pointermoved);
});
```

## Deps

```js eval
`My name is ${name}, I'm at <${pointer[0].toFixed(2)}, ${pointer[1].toFixed(
  2
)}> and counting to ${count}.`;
```

## Input

```js eval
name = new Observable((observer) => {
  const input = document.createElement("input");
  observer.resolve(input);

  const onChange = (e) => observer.next(e.target.value);
  input.addEventListener("input", onChange);
  observer.next("");

  return () => input.removeEventListener("input", onChange);
});
```
