const regexType = /\|\s*([^\s]+)/;
const regexDIV = /(\<div class="[^"]*")/;
const regexQuote = /['"]([^'"]+)['"]/;

export function attrs(md) {
  const fence = md.renderer.rules.fence;
  if (!fence) return;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const { info } = token;

    // Block type.
    const matchType = info.match(regexType);
    const type = matchType ? matchType[1] : null;

    // Language.
    const lang = info.split(" ")[0];

    // Options
    const matchQuote = info.match(regexQuote);
    const quote = matchQuote ? matchQuote[1] : null;
    const options = quote
      ? quote
          .split(";")
          .map((d) => d.split(":").map((s) => s.trim()))
          .map((d) => `data-${d[0]}="${d[1]}"`)
          .join(" ")
      : "";

    if (!type) return fence(...args);
    const html = fence(...args);
    const newHTML = html.replace(
      regexDIV,
      `$1 data-genji="${type}" data-lang="${lang}" ${options}`
    );
    return newHTML;
  };
}
