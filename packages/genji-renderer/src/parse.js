import MarkdownIt from "markdown-it";
import { CODEBLOCK } from "./constants";

function trimSplit(string, by) {
  return string.split(by).map((d) => d.trim());
}

function parseOptions(options) {
  if (options === "") return {};
  return options.split(";").reduce((obj, string) => {
    const [key, value] = trimSplit(string, ":");
    obj[key] = new Function(`return ${value}`)();
    return obj;
  }, {});
}

function parseInfo(info) {
  const [lang, suffix = ""] = trimSplit(info, "|");
  const [markup, options = ""] = trimSplit(suffix, "\"");
  return [lang, markup, parseOptions(options)];
}

export function useMarkdownIt(options) {
  const { markdownItOptions, loader } = options;
  const md = new MarkdownIt(markdownItOptions);
  const defaultFenceRenderer = md.renderer.rules.fence;
  const tokenById = new Map();
  const idOf = (index) => `${CODEBLOCK}-${index}`;
  const supportLangs = Object.keys(loader);
  md.renderer.rules.fence = (tokens, index, ...rest) => {
    const token = tokens[index];
    const { info } = token;
    const [lang, markup, options] = parseInfo(info);
    if (markup === "pure" || !supportLangs.includes(lang)) {
      return defaultFenceRenderer(tokens, index, ...rest);
    }
    token.lang = lang;
    token.markup = markup === "" ? "dom" : markup;
    token.options = options;
    const id = idOf(index);
    tokenById.set(id, token);
    return `<div class=${CODEBLOCK} id=${id}></div>`;
  };
  return [tokenById, md.render.bind(md)];
}
