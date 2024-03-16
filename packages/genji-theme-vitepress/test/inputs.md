# Inputs

## Button

```js eval
replay = Inputs.button("Replay", { label: "click me" });
```

```js eval
(() => {
  replay;
  const span = document.createElement("span");
  span.textContent = 0;
  const timer = setInterval(
    () => (span.textContent = +span.textContent + 1),
    1000
  );
  unsubscribe(() => clearInterval(timer));
  return span;
})();
```

## Color

```js eval
color = Inputs.color({ label: "Pick a color" });
```

```js eval
block(color);
```

## Range

```js eval
number = Inputs.range([0, 100], { label: "Amount", step: 1, value: 30 });
```

```js eval
number;
```

## Select

```js eval
select = Inputs.select(["Small", "Medium", "Large"], { label: "Size" });
```

```js eval
`Select ${select}`;
```

## Table

```js eval
data = Inputs.table([
  { genre: "Sports", sold: 275 },
  { genre: "Strategy", sold: 115 },
  { genre: "Action", sold: 120 },
  { genre: "Shooter", sold: 350 },
  { genre: "Other", sold: 150 },
]);
```

```js eval
data;
```

## Text

```js eval
name = Inputs.text({ label: "Input your name" });
```

```js eval
`My name is ${name}`;
```
