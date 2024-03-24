# Inputs

**Inputs** are functions that mount given elements like _button_, _slider_ and return a [signal](/feautres/signal) to accept data from a user and enable interaction.

Genji provides some built-in inputs, adapting from [@observablehq/inputs](https://github.com/observablehq/inputs), and you can also wrapper custom elements you design, such as chart, into inputs by [_Inputs.fromElement(element)_](/reference/inputs#fromElement).

## Built-in inputs

> Currently Genji exports only a subset of inputs in @observablehq/inputs, you can open a PR if you want more.

Built-in inputs can be accessed directly through _Inputs_ namespace.

For example, to define a [range input](/reference/inputs#range):

```js eval
size = Inputs.range([0, 300], { label: "size", value: 100, step: 1 });
```

The size variable here will reactively update when the user interacts with the range input, triggering re-evaluation of referencing code blocks.

```js eval
call(() => {
  const div = document.createElement("div");
  div.style.width = size + "px";
  div.style.height = "100px";
  div.style.background = "black";
  return div;
});
```

## Custom inputs

If an element emits the _input_ event and has a _value_ attribute, it can be converted to a custom input using [_Inputs.fromElement(element)_](/reference/inputs#fromElement).

For example, to define a custom text input:

```js eval
text = Inputs.fromElement(document.createElement("input"));
```

```js eval
text;
```

It is also possible to convert some complex elements satisfying the condition, such as the returned _SVG_ elements from Plots in [@observablehq/plot](https://github.com/observablehq/plot).

```js eval
tips = Inputs.fromElement(
  Plot.barY(
    [
      { genre: "Sports", sold: 275 },
      { genre: "Strategy", sold: 115 },
      { genre: "Action", sold: 120 },
      { genre: "Shooter", sold: 350 },
      { genre: "Other", sold: 150 },
    ],
    { x: "genre", y: "sold", tip: true }
  ).plot()
);
```

```js eval
tips;
```
