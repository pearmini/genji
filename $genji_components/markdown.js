import { md, href } from "../utils.js";

export const Markdown = {
  template: `<article class="markdown-body" v-html="html"></article>`,
  props: ["content"],
  computed: {
    html() {
      const raw = md.render(this.content);
      return raw
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", "");
    },
  },
  mounted() {
    // 给标题添加锚点
    const h = ["h1", "h2", "h3", "h4"];
    const elements = h.flatMap((d) =>
      Array.from(document.querySelectorAll(`.markdown-body > ${d}`))
    );
    for (const e of elements) {
      e.innerText = e.innerText.replaceAll("#", "");
      e.setAttribute("id", `${href(e.innerText)}`);
      const a = document.createElement("a");
      a.innerText = "#";
      a.setAttribute("name", href(e.innerText));
      a.setAttribute("class", "markdown-body__anchor");
      a.setAttribute("href", `#${href(e.innerText)}`);
      e.appendChild(a);
    }
  },
};
