# Genji Notebook

Build observable and interactive JavaScript notebook from pure markdown. It is inspired by [Observable](https://observablehq.com/).

![sparrow](./assets/sparrow.jpg)

## Get Started

Install genji-notebook from NPM.

```bash
$ npm i genji-notebook
```

Creates a new config file named `.genjirc` in your project root, and specifies the `outline` options.

```json
{
  "outline": {
    "Hello World": "hello-world"
  }
}
```

Creates a folder named `docs` in your project root and creates a markdown file named `hello-world.md` with following content.

<pre>
# Hello World

```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = "Hello World";
  div.style.background = "red";
  return div;
})();
```
</pre>

Run following command in your project root for development and open `http://localhost:8000/` in your browser.

```bash
$ genji dev
```

Everything is working as expected if your see the page as blow.

![example](./assets/example.jpg)

Run the following command in your project root before you want to deploy your site.

```bash
$ genji build
```

## API Reference

Every codeblock in JavaScript with markup: `js | dom` with execute and mounted the return value if it is `HTMLElement` or `SVGElement`.

The valid code in codeblocks can be a function returns a `HTMLElement` or `SVGElement`.

<pre>
```js | dom
sp.plot(options) // return a SVGElement
```
</pre>

It also can be an IIFE(immediately-invoked function expression) for complex codeblocks.

<pre>
```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = "Hello World";
  div.style.background = "red";
  return div;
})();
```
</pre>

Async function is also ok.

<pre>
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
</pre>

Codeblock with `pin: false` options will hide the code by default. **The options can be only specified in double quote as following.**

```js | dom "pin: false"
(() => {
  const div = document.createElement("div");
  div.innerText = "Hello World";
  div.style.background = "red";
  return div;
})();
```

The options for `.genjirc` is as followed.

| Key                  | Type       | Description                                                                                                                                                                                      | Default                                        |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| input                | `string`   | The path to the folder contains all the markdowns.                                                                                                                                               | `docs`                                         |
| output               | `string`   | The path to produce site.                                                                                                                                                                        | `dist`                                         |
| outline              | `object`   | A nested object to specifies the outline. Every key of the object is the name displayed in the sidebar. It relates a markdown if the value is its name and it can be a section with object value | -                                              |
| assets               | `string`   | The path to the assets folder and all the assets used for the site should be in it.                                                                                                              | `assets`                                       |
| logo                 | `string`   | The path to the logo of the site.                                                                                                                                                                | -                                              |
| github               | `string`   | The github link for the site.                                                                                                                                                                    | -                                              |
| link                 | `string`   | The custom link for the site.                                                                                                                                                                    | -                                              |
| notFound.title       | `string`   | The title for missing page.                                                                                                                                                                      | `Page Not Found`                               |
| notFound.description | `string`   | The description for the missing page.                                                                                                                                                            | `We could not find what you were looking for.` |
| scripts              | `string[]` | A path array to the scripts used in the site.                                                                                                                                                    | []                                             |
| theme.mainColor      | `string`   | The main color for the site.                                                                                                                                                                     | `#28DF99`                                      |

See more in [demo](./demo/.genjirc) as example.

## License

MIT
