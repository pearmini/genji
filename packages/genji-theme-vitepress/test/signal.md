# Signal

## Basic

```js eval
count = Signals.define((next) => {
  let count = 0;
  next(count++);
  const timer = setInterval(() => next(count++), 1000);
  return () => clearInterval(timer);
});
```

## Mouse

```js eval
pointer = Signals.define((next) => {
  const pointermoved = (event) => next([event.clientX, event.clientY]);
  addEventListener("pointermove", pointermoved);
  next([0, 0]);
  return () => removeEventListener("pointermove", pointermoved);
});
```

## Deps

```js eval
`My name is ${name}, I'm at <${pointer[0].toFixed(2)}, ${pointer[1].toFixed(2)}> and counting to ${count}.`;
```

## Input

```js eval
name = Signals.define((next, view) => {
  const input = document.createElement("input");
  view(input);

  const onChange = (e) => next(e.target.value);
  input.addEventListener("input", onChange);
  next("");

  return () => input.removeEventListener("input", onChange);
});
```

## Now

```js eval
Signals.now();
```

```js eval
now;
```

## Width

```js eval
Signals.width();
```

```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = width / 2 + "px";
  div.style.height = "50px";
  div.style.background = "steelblue";
  return div;
})();
```
