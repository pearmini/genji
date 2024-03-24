# Libraries

Some built-in variables or functions can be accessed in code blocks.

## width

The reactive [signal](#signal) produces the current width of page.

```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = width + "px";
  div.style.height = "100px";
  div.style.background = "orange";
  div.style.borderRadius = "10px";
  return div;
})();
```

## now

The reactive [signal](#signal) produces the current timestamp.

```js eval
now;
```

## call(_callback_) {#call}

Calls the specified _callback_ and returns its output. It is a convenient replacement for IIFE(immediately-invoked function expression).

```js eval
call(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "orange";
  return div;
});
```

## unsubscribe(_hook_) {#unsubscribe}

Registers a disposal hook for the given code block, which will be called before the code block is re-run". It is useful to "clean up" a code block, say to cancel an animation loop or close a socket.

```js eval code=false
reset = Inputs.button("Reset", { label: "click me" });
```

```js eval
call(() => {
  reset;
  const span = document.createElement("span");
  span.textContent = 0;
  const counting = () => (span.textContent = +span.textContent + 1);
  const timer = setInterval(counting, 1000);
  unsubscribe(() => clearInterval(timer));
  return span;
});
```

## Signal(_executor_) {#signal}

Defines a new signal with specified _executor_. The _executor_ is a function executed by the constructor, which receives two functions as parameters: _next_ and _view_. The _next_ function is used to produce new values continuously and can be called multiple times. The _view_ function is used to resolve the mounted element and can be called only one time.

In Genji, if the _view_ function of a signal is not called, the new values produced by the _next_ function will be inspected into the document. For example, to track the mouse position:

```js eval
pointer = new Signal((next) => {
  const pointermoved = (event) => next([event.clientX, event.clientY]);
  addEventListener("pointermove", pointermoved);
  next([0, 0]);
  return () => removeEventListener("pointermove", pointermoved);
});
```

Otherwise the return element will be displayed in the document. For example, to define a custom input:

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
