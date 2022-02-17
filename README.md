# Genji Notebook

Interactive JavaScript Notebook.

## Get Started

```bash
$ npm i genji-notebook
```

`genji.config.js`

```js
module.exports = {
  input: "docs/",
  output: "dist/",
  outline: {
    hello: "hello",
  },
};
```

`docs/hello.md`

<pre>
# Hello

```js
(() => {
  const div = document.createElement("div");
  div.innerText = text;
  return div;
})();
```

```js
text = "hello world";
```
</pre>

```bash
$ genji dev
```

```bash
$ genji build
```

## API Reference

<pre>
```js | pure
```
</pre>

<pre>
```js | dom``
```
</pre>

<pre>
```js | json``
```
</pre>

<pre>
```js | csv``
```
</pre>

<pre>
```js | input``
```
</pre>

<pre>
```js | number``
```
</pre>

<pre>
```js | color``
```
</pre>

<pre>
```js | radio``
```
</pre>

<pre>
```js | switch``
```
</pre>
