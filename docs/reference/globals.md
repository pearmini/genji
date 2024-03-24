# Globals

Some global functions can be accessed in code blocks.

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
