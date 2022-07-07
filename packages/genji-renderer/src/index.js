import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "github-markdown-css/github-markdown-light.css";

const md = new MarkdownIt({
  highlight: (code, language) => {
    try {
      return hljs.highlight(code, { language }).value;
    } catch (e) {
      return "";
    }
  },
});

export function createRender(options = {}) {
  return (markdown) => {
    const { container = document.createElement("div") } = options;
    container.innerHTML = md.render(markdown);
    container.className = "markdown-body";
    return container;
  };
}
