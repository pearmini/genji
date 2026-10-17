# Magic Variables <VersionBadge version="0.3.0"/>

**Magic variables** show their current values inside the code that uses them. When a variable's name starts and ends with `$$`, such as `$$size$$`, each code block that references it displays the value in place of the name, and updates it whenever the value changes.

They are useful for explaining options: readers adjust an input and see exactly which value the code runs with.

## Numbers

For example, define a magic variable with a [range input](/reference/inputs#range). Hiding the code block with the [code directive](/reference/directives) leaves only the slider:

```js eval code=false
$$size$$ = Inputs.range([0, 300], { label: "size", value: 100, step: 1 });
```

Drag the slider, and the number in the following code block changes with it:

```js eval
call(() => {
  const size = $$size$$;
  const div = document.createElement("div");
  div.style.width = size + "px";
  div.style.height = "50px";
  div.style.background = "black";
  return div;
});
```

The same works for any option you want readers to explore, such as the margin of a chart made with [Observable Plot](https://observablehq.com/plot/):

```js eval code=false
$$marginLeft$$ = Inputs.range([0, 120], { label: "marginLeft", value: 60, step: 1 });
```

```js eval
Plot.plot({
  marginLeft: $$marginLeft$$,
  marks: [
    Plot.barY(
      [
        { genre: "Sports", sold: 275 },
        { genre: "Strategy", sold: 115 },
        { genre: "Action", sold: 120 },
        { genre: "Shooter", sold: 350 },
        { genre: "Other", sold: 150 },
      ],
      { x: "genre", y: "sold" }
    ),
  ],
});
```

## Strings

Strings are shown with quotes, matching the quote style used by most code blocks on the page:

```js eval code=false
$$name$$ = Inputs.text({ label: "name", value: "Genji" });
```

```js eval
`Hello, ${$$name$$}!`;
```

A color from a [color input](/reference/inputs#color) is a string too:

```js eval code=false
$$color$$ = Inputs.color({ label: "color", value: "#4269d0" });
```

```js eval
block($$color$$);
```

## Signals

A magic variable can hold any [signal](/features/signals), not only an input. For example, to show the current [width](/reference/signals#width) of the page:

```js eval
$$width$$ = width;
```

Resize the window to see this value change:

```js eval
`The page is ${$$width$$}px wide.`;
```

## Rules

- A magic variable is declared like any other variable, but its name must start and end with `$$`.
- Only code blocks that **reference** the variable show its value. The block that declares it keeps the name.
- Numbers are shown as they are, and strings are wrapped in quotes. Other values, such as objects, are not formatted, so magic variables work best with numbers and strings.

::: tip
Reference each magic variable once per code block. If a block uses the value in several places, assign it to a local variable first, like `const size = $$size$$;` above.
:::
