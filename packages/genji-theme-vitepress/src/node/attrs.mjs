import { parseMeta } from "genji-runtime/node";

export function attrs(md) {
  const fence = md.renderer.rules.fence;
  if (!fence) return;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const { info } = token;

    const meta = parseMeta(info);
    if (!meta) return fence(...args);

    const html = fence(...args);
    const newHTML = `<div class="genji-cell" data-options="${info}"></div>${html}`;
    return newHTML;
  };
}
