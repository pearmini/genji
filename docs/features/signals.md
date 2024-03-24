# Signals

Signals, unlike [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolve only once, have the capability to produce values asynchronously multiple times.

The constructor of Signal is described as:

```js
new Signal(executor);
```

The _executor_ is a function executed by the constructor, which receives two functions as parameters: _next_ and _view_ and returns a _disposal hook_:

```js
new Signal((next, value) => {
  return () => {};
});
```

## _next(value)_ {#next}

Every time the _next_ callback of the specified _executor_ is called, a new value is generated, triggering re-renders the outputs of any referencing blocks.

In Genji, if the _view_ function of a signal is not called, the new values produced by the _next_ function will be inspected into the document. For example, to track the mouse position:

```js eval
pointer = new Signal((next) => {
  const pointermoved = (event) => next([event.clientX, event.clientY]);
  addEventListener("pointermove", pointermoved);
  next([0, 0]);
  return () => removeEventListener("pointermove", pointermoved);
});
```

```js eval
`The mouse is at <${pointer[0].toFixed(2)}, ${pointer[1].toFixed(2)}>.`;
```

## _view(element)_ {#element}

If the _view_ callback is called, the return element will be displayed in the document. For example, to define a custom input:

```js eval
name = new Signal((next, view) => {
  const input = document.createElement("input");
  const onChange = (e) => next(e.target.value);
  input.addEventListener("input", onChange);
  view(input);
  next("");
  return () => input.removeEventListener("input", onChange);
});
```

```js eval
`My name is ${name}`;
```

## Disposal hook

The disposal hook should dispose some resources the Signal allocates, say to cancel an animation loop or remove event listeners.

```js eval code=false
restart = Inputs.button("restart", { label: "Click me" });
```

```js eval
new Signal((next, view) => {
  restart;
  let count = 0;
  const timer = setInterval(() => next(++count), 1000);
  next(count);
  return () => clearInterval(timer);
});
```

## Global signals

There are some global signals can be accessed directly in code blocks, such as _[width](/reference/signals#width)_ and _[now](/reference/signals#now)_.

The _width_ signal produces the current width of page, say to draw a responsive box:

```js eval
box(width);
```

The _now_ signal produces the current timestamp:

```js eval
now;
```

Say to author a smooth animation:

```js eval
box(((Math.sin(now / 1000) + 1) * width) / 2);
```

## Appendix

```js eval
function box(size) {
  const div = document.createElement("div");
  div.style.width = size + "px";
  div.style.height = "100px";
  div.style.background = "black";
  div.style.borderRadius = "10px";
  return div;
}
```
