# Test

- <a href="#test-code">Test Code</a>
  - <a href="#test-basic-usage">Test Basic Usage</a>
  - <a href="#test-advanced-usage">Test Advanced Usage</a>
- <a href="#test-markdown">Test Markdown</a>

## Test Codeblock

This is for codeblock in markdown.

## Test Basic Usage

Test pure JavaScript code: `js | pure`, it should render a static codeblock.

```js | pure
// pure js
(() => {
  const div = document.createElement("div");
  div.innerText = "hello";
  div.style.background = "red";
  return div;
})();
```

Test JavaScript code with dom markup: `js | dom` or just `js`, it should both render a red div with "hello" and a interactive codeblock.

```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = "hello";
  div.style.background = "red";
  return div;
})();
```

Test async JavaScript code, it should delay to render a red.

```js | dom
(async () => {
  const text = await new Promise((resolve) =>
    setTimeout(() => resolve("hello"), 3000)
  );
  const div = document.createElement("div");
  div.innerText = "hello";
  div.style.background = "red";
  return div;
})();
```

Test other language with dom markup: 'py | dom', it should only render a static codeblock.

```py
print('hello world')
```

Test JavaScript code with pin options: `js | dom "pin: false"`, it should not render a codeblock.

```js | dom "pin: false"
(() => {
  const div = document.createElement("div");
  div.innerText = "hello";
  div.style.background = "red";
  return div;
})();
```

Test JavaScript code returns a array: `[DOM, clearCallback]`, it should call clearCallback after unmounted.

```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = "1";
  div.style.background = "#28DF99";
  div.style.height = "150px";
  div.style.width = "1000px";
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

Test JavaScript throws a error, it should render a error output.

```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = text;
  return div;
})();
```

## Test Advanced Usage

Test using third-party library.

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

## Test Markdown

> test quote

- Test li
- Test li
  - Test li
  - Test li
- Test li

This is a **test** paragraph for [_markdown-it_](https://github.com/markdown-it/markdown-it).

Test jump between notebooks: [Name with line](./name-with-line).

Test static assets.

![](../assets/introduction/logo.png)
