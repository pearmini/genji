import { md } from "../utils.js";
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
    const h = ["h1", "h2", "h3", "h4"];
    const elements = h.flatMap((d) =>
      Array.from(document.querySelectorAll(`.markdown-body > ${d}`))
    );
    for (const e of elements) {
      e.innerText = e.innerText.replaceAll("#", "");
      const a = document.createElement("a");
      a.innerText = "#";
      a.setAttribute("name", e.innerText.split(" ").join("-").toLowerCase());
      a.setAttribute("class", "markdown-body__anchor");
      e.appendChild(a);
    }
  },
};
