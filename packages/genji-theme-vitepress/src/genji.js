const regexType = /\|\s*([^\s]+)/;
const regexDIV = /(\<div class="[^"]*")/;

export function genjiPlugin(md) {
  const fence = md.renderer.rules.fence;
  if (!fence) return;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const { info } = token;
    const match = info.match(regexType);
    const result = match ? match[1] : null;
    const lang = info.split(" ")[0];
    if (!result) return fence(...args);
    const html = fence(...args);
    const newHTML = html.replace(
      regexDIV,
      `$1 data-genji="${result}" data-lang="${lang}"`
    );
    return newHTML;
  };
}
