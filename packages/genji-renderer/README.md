# Genji Renderer

> WIP

## Get Started

```js
import { createRenderer } from "genji-renderer";

const md = createRenderer();
const node = md(`
# Hello World

~~~js
(() => {
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.background = "orange";
})();
~~~
`);

document.body.appendChild(node);
```
