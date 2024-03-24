# What is Genji?

**Markdown Genji** is the markdown extension for authoring interactive documents, named after the coolest [hero](https://overwatch.blizzard.com/zh-tw/heroes/genji/) in [Overwatch](https://overwatch.blizzard.com/).

![overwatch-genji](https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/bltc878fc10bd8ab2cb/63880951443fa70e71d4bfc5/genji-02.jpg?format=webply&quality=90)

It is inspired by [Observable Notebook](https://observablehq.com/) and can be used in popular Static Site Generator (SSG) frameworks, such as [VitePress](https://vitepress.dev/), through the use of plugins and themes.

The foundation of Genji's features rests on two principles:

- All code blocks are executable.
- Each markdown page incorporates a reactive system.

Here's a quick overview of Genji's core features.

## Executable Code Blocks

In Genji, every fenced codeblock marked with `eval` [directive](/reference/directives) in Genji is **executable**. Each code block should contain only one _statement_ or _expression_. The evaluated result of the code block will be inspected and rendered into the document.

For example, to render a red block:

````md
```js eval
(() => {
  const div = document.createElement("div");
  div.style.height = 100 + "px";
  div.style.width = 100 + "px";
  div.style.background = "red";
  return div;
})();
```
````

This produces:

```js eval
(() => {
  const div = document.createElement("div");
  div.style.height = 100 + "px";
  div.style.width = 100 + "px";
  div.style.background = "red";
  return div;
})();
```

## Modular Page

Each page in Genji acts as a module, meaning that code blocks within the same markdown run in a shared context and can reference each other.

For example, let' define a `block` function:

````md
```js eval
function block(color) {
  const div = document.createElement("div");
  div.style.height = 100 + "px";
  div.style.width = 100 + "px";
  div.style.background = color;
  return div;
}
```
````

This produces:

```js eval
function block(color, size) {
  const div = document.createElement("div");
  div.style.height = 100 + "px";
  div.style.width = size + "px";
  div.style.background = color;
  return div;
}
```

Then you can use that function across other code blocks on the same page:

````md
```js eval
block("steelblue", 200);
```
````

This produces:

```js eval
block("steelblue", 200);
```

Note that that it's unnecessary to arrange code blocks in their execution order, Genji intelligently determines the correct sequence for running the code blocks.

## Extensible Libraries

The built-in libraries in Genji bind certain variables to the global window object, allowing you to access them in any code block, such as the `call` function:

````md
```js eval
call(() => {
  const div = document.createElement("div");
  div.style.height = 100 + "px";
  div.style.width = 100 + "px";
  div.style.background = "red";
  return div;
});
```
````

This produces:

```js eval
call(() => {
  const div = document.createElement("div");
  div.style.height = 100 + "px";
  div.style.width = 100 + "px";
  div.style.background = "red";
  return div;
});
```

You can also integrate your own custom libraries, say to draw a scatterplot by [D3](https://d3js.org/) and [Observable Plot](https://observablehq.com/plot/):

````md
```js eval
data = d3.json(
  "https://cdn.jsdelivr.net/npm/vega-datasets@2.8.1/data/cars.json"
);
```

```js eval
Plot.dot(data, { x: "Horsepower", y: "Miles_per_Gallon" }).plot();
```
````

This produces:

```js eval
cars = d3.json(
  "https://cdn.jsdelivr.net/npm/vega-datasets@2.8.1/data/cars.json"
);
```

```js eval
Plot.dot(cars, { x: "Horsepower", y: "Miles_per_Gallon" }).plot();
```

## Reactive Inputs

Built-in inputs allow dynamic interaction within the code blocks. Changing these inputs automatically updates and re-renders the outputs of any referencing blocks, providing an interactive way to visualize the effects of different parameter values.

For example, to see how _size_ parameters affects `block` function, using `code=false` to hide the code for a cleaner display.

````md
```js eval code=false
size = Inputs.range([50, 300], { label: "size", step: 1 });
```

```js eval code=false
color = Inputs.color({ label: "color", value: "#58A65C" });
```

```js eval
block(color, size);
```
````

This produces:

```js eval code=false
size = Inputs.range([50, 300], { label: "size", step: 1 });
```

```js eval code=false
color = Inputs.color({ label: "color", value: "#58A65C" });
```

```js eval
block(color, size);
```

## Reactive Signals

Signals, unlike Promises that resolve only once, have the capability to produce values asynchronously multiple times. Every time the _next_ callback is called, a new value is generated, triggering re-renders the outputs of any referencing blocks.

For example, to define a signal to produce the current mouse position:

````md
```js eval
pointer = new Signal((next) => {
  const pointermoved = (event) => next([event.clientX, event.clientY]);
  addEventListener("pointermove", pointermoved);
  next([0, 0]);
  return () => removeEventListener("pointermove", pointermoved);
});
```

```js eval
`The current pointer is <${pointer[0]}, ${pointer[1]}>`;
```
````

This produces:

```js eval
pointer = new Signal((next) => {
  const pointermoved = (event) => next([event.clientX, event.clientY]);
  addEventListener("pointermove", pointermoved);
  next([0, 0]);
  return () => removeEventListener("pointermove", pointermoved);
});
```

```js eval
`The current pointer is <${pointer[0]}, ${pointer[1]}>`;
```

Each inputs is a signal with _view_ callback is called to return and mount a DOM.

For example, let's define a custom text input:

````md
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
`My name is ${name}.`;
```
````

This produces:

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
`My name is ${name}.`;
```

## Powerful Transforms

Typically, only JavaScript code blocks can be executed directly, but you can use **transforms** to transform the non-JavaScript code into executable JavaScript code.

For example, to execute the Python `print` function by employing a predefined `py` transform:

```js
function py(code) {
  return code.replace("print", "new Array");
}
```

Mark the Python code block with `t=py` to specify the `py` transform:

````md
```py eval t=py
print(1, 2)
```
````

This produces:

```py eval t=py
print(1, 2)
```

The other usage of transform is to hide certain parts of the code that you don't want to display.

For example, to hide setup and teardown operations when using [Charming](https://github.com/charming-art/charming):

````md
```js eval
call(() => {
  const app = cm.app({ width: 600, height: 200 });

  app.data(cm.range(10)).append(cm.circle, {
    x: () => cm.random(0, app.prop("width")),
    y: () => cm.random(0, app.prop("height")),
    r: 50,
    fill: "black",
  });

  function dispose(app) {
    unsubscribe(() => app.dispose());
  }

  function border(app) {
    app.node().style.border = "solid #000 1px";
  }

  return app.call(dispose).call(border).render().node();
});
```
````

With the `cm` function is defined:

```js
function cm(code) {
  return `
    call(() => {
      const app = cm.app({ width: 600, height: 200 });

      ${code}
    
      function dispose(app) {
        unsubscribe(() => app.dispose());
      }

      function border(app) {
        app.node().style.border = "solid #000 1px";
      }

      return app.call(dispose).call(border).render().node();
    })
  `;
}
```

Now say:

````md
```js eval t=cm
app.data(cm.range(100)).append(cm.circle, {
  x: () => cm.random(app.prop("width")),
  y: () => cm.random(app.prop("height")),
  fill: "rgba(175, 175, 175, 0.5)",
  stroke: cm.rgb(0),
  r: 16,
});
```
````

This produces:

```js eval t=cm
app.data(cm.range(100)).append(cm.circle, {
  x: () => cm.random(app.prop("width")),
  y: () => cm.random(app.prop("height")),
  fill: "rgba(175, 175, 175, 0.5)",
  stroke: cm.rgb(0),
  r: 16,
});
```
