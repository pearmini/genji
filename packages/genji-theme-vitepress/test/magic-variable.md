# Magic Variable

## Numbers

```js eval
$$number$$ = Inputs.range([0, 100], { label: "Amount", step: 1, value: 50 });
```

```js eval
(() => {
  const width = $$number$$;
  const div = document.createElement("div");
  div.style.width = `${width}px`;
  div.style.height = "50px";
  div.style.background = "red";
  return div;
})();
```

## Strings

```js eval
$$name$$ = Inputs.text({ label: "Input your name" });
```

```js eval
`My name is ${$$name$$}`;
```

## Color

```js eval
$$color$$ = Inputs.color({ label: "Pick a color" });
```

```js eval
block($$color$$);
```

## Width

```js eval
$$width$$ = width;
```

```js eval
w = $$width$$;
```
