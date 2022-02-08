# Hello

> hello world

```js
(() => {
  const div = document.createElement("div");
  div.innerText = "hello";
  div.style.background = "red";
  return div;
})();
```

This is a **test** paragraph for [_markdown-it_](https://github.com/markdown-it/markdown-it).

```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = "1";
  div.style.background = "#28DF99";
  div.style.height = "150px";
  div.style.lineHeight = "150px";
  div.style.fontSize = "100px";
  div.style.color = "white";
  div.style.textAlign = "center";
  const timer = setInterval(() => {
    const number = +div.innerText;
    div.innerText = number + 1;
  }, 1000);
  return [div, () => clearInterval(timer)];
})();
```

- JavaScript
- Python
- Rust

```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = text;
  return div;
})();
```

```js | dom
sp.plot({
  data: [
    { genre: "Sports", sold: 275 },
    { genre: "Strategy", sold: 115 },
    { genre: "Action", sold: 120 },
    { genre: "Shooter", sold: 350 },
    { genre: "Other", sold: 150 },
  ],
  element: "interval",
  encode: [
    { channel: "x", field: "genre" },
    { channel: "y", field: "sold" },
    { channel: "fill", field: "genre" },
  ],
});
```
