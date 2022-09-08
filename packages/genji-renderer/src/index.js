import hljs from "highlight.js";
import { merge } from "lodash";
import { loader } from "./loaders";
import { useMarkdownIt } from "./parse";
import { renderCodeBlocks } from "./runtime";
import { CODEBLOCK } from "./constants";
import { markup } from "./markups";

const DEFAULT_OPTIONS = {
  container: document.createElement("div"),
  markdownItOptions: {
    highlight: (code, language) => {
      try {
        return hljs.highlight(code, { language }).value;
      } catch (e) {
        return "";
      }
    },
  },
  loader,
  markup,
};

export function createRenderer(rawOptions = {}) {
  const options = merge(merge({}, DEFAULT_OPTIONS), rawOptions);
  const [tokenById, renderMarkdown] = useMarkdownIt(options);
  return (markdown) => {
    const { container } = options;
    container.innerHTML = renderMarkdown(markdown);
    const codeblocks = container.getElementsByClassName(CODEBLOCK);
    renderCodeBlocks(codeblocks, tokenById, options);
    return container;
  };
}
