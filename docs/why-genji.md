# Why Genji?

Interactive documents are popular nowadays among technical writers, because they allow them to use animation and interaction to communicate complex ideas. Although this kind of interactive media tend to explain concepts more clearly and engage a large audience, existing tools are not convenient enough to produce them efficiently.

Introducing **Genji**: the interactive Markdown extension, which is inspired by [Observable Notebook](https://observablehq.com/). Genji slightly extends the Markdown syntax to make code blocks executable and implements a reactive system to enhance interactivity via reactivity . It integrates seamlessly with existing Static Site Generator (SSG) frameworks, such as [VitePress](https://vitepress.dev/), fitting smoothly into your current writing workflow.

**To put it simply: with Genji, you can create interactive documents using just Markdown.**

## Genji is just code block

A primary feature of interactive documents is that they allow technical writers to show the results of code directly instead of using static pictures. In Genji, fenced code blocks marked with `eval` will execute and directly render the results into the document.

For example, to preview the output of [Observable Plot](https://observablehq.com/plot/):

````md
```js eval
Plot.barY(
  [
    { genre: "Sports", sold: 275 },
    { genre: "Strategy", sold: 115 },
    { genre: "Action", sold: 120 },
    { genre: "Shooter", sold: 350 },
    { genre: "Other", sold: 150 },
  ],
  { x: "genre", y: "sold" }
).plot();
```
````

This produces:

```js eval
Plot.barY(
  [
    { genre: "Sports", sold: 275 },
    { genre: "Strategy", sold: 115 },
    { genre: "Action", sold: 120 },
    { genre: "Shooter", sold: 350 },
    { genre: "Other", sold: 150 },
  ],
  { x: "genre", y: "sold" }
).plot();
```

Although you can integrate some online web editors like [CodeSandBox](https://codesandbox.io/) into your documents to preview results, they often add heavy visual and functional bulk. Most importantly, their execution context is isolated, meaning there is no way to share logic and interact with one another.

In Genji, code blocks on one page execute in the same context and are reactive. Once a code block produces new value, all dependent code blocks will re-evaluate.

For example, let's refactor the code and the observe the usage of scale `padding` option in Observable Plot:

````md
```js eval
data = [
  { genre: "Sports", sold: 275 },
  { genre: "Strategy", sold: 115 },
  { genre: "Action", sold: 120 },
  { genre: "Shooter", sold: 350 },
  { genre: "Other", sold: 150 },
];
```

```js eval code=false
padding = Inputs.range([0, 1], { label: "padding", step: 0.1 });
```

```js eval
Plot.barY(data, { x: "genre", y: "sold" }).plot({ x: { padding } });
```
````

This produces:

```js eval
data = [
  { genre: "Sports", sold: 275 },
  { genre: "Strategy", sold: 115 },
  { genre: "Action", sold: 120 },
  { genre: "Shooter", sold: 350 },
  { genre: "Other", sold: 150 },
];
```

```js eval code=false
padding = Inputs.range([0, 1], { label: "padding", step: 0.1 });
```

```js eval
Plot.barY(data, { x: "genre", y: "sold" }).plot({ x: { padding } });
```

Generally speaking, the syntax of Genji largely revolves around **code blocks**.

## Genji is just Markdown

Unlike some advanced tools like [Idyll](https://idyll-lang.org/docs), which introduce a comprehensive syntax for authoring complex interactive documents, Genji focuses on simplicity by sticking to just Markdown. **This means Genji is easy to learn, particularly for developers**. For beginners, there's only one rule to remember: fenced JavaScript code blocks marked with eval are executable and mountable.

As demonstrated, simply adding an `eval` marker will make the following code block executable:

````md
```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "steelblue";
  return div;
})();
```
````

This produces:

```js eval
(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "steelblue";
  return div;
})();
```

## Genji is just JavaScript

Several tools already offer solutions for rendering code in Markdown. Vue-based SSGs support the writing of Vue component in Markdown, such as with [VitePress](https://vitepress.dev/), while React-based SSGs allow for React components in Markdown, often referred to as MDX, such as [Docusaurus](https://docusaurus.io/).

However, these not only introduce an additional learning curve (as users must understand Vue or React component), but they also require wrapping native JavaScript into Vue or React components, which can introduce superfluous and distracting code.

Genji employs pure JavaScript, without any custom syntax, unlike Observable Notebook. However, this dose not mean Genji is limited to executing only JavaScript code. Genji provides a convenient mechanism known as **transform**, which can convert code from different languages like TypeScript, Vue, React, Python, and more, into executable native JavaScript before executing.

## Genji is just extension

Conceptually, Genji is simply an extension of Markdown, defined as a specification for the interactive syntax and desired outcome. This means any tools can incorporate Genji by implementing the described specification, making it particularly suitable for SSGs. Currently Genji can be used in VitePress via the custom theme: genji-theme-vitepress. And there are plans to develop additional Genji themes and plugins for other SSGs in the future, such as [Docusaurus](https://docusaurus.io/), [Nextra](https://nextra.site/), [Rspress](https://rspress.dev/) and more.

One great thing about the extension approach is that allows you to leverage the existing features of the chosen SSG. Interactivity is just one aspect of what SSGs offer, and there's no need to develop a new SSG solely to support interactive syntax.

Moreover, it solves an issue that has troubled me for a long time: Observable Notebook can't serve locally. While an online platform is excellent for exploration, SSGs are more appropriate for writing documentation or creating personal blogs, as they offer the following advantages:

- You hold your own data.
- You can deploy your content anywhere.
- It's more SEO-friendly.
- It's more lightweight without the embedded editor.
- And more...

At last, I hope Genji offers you a pleasant writing experience and makes your documents more appealing!
