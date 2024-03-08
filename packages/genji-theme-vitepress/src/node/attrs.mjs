const regexDIV = /(\<div class="[^"]*")/;
const regexQuote = /['"]([^'"]+)['"]/;

export function attrs(md) {
  const fence = md.renderer.rules.fence;
  if (!fence) return;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const { info } = token;
    const infoTokens = info.split(" ");

    const shouldEval = infoTokens.includes("eval");
    if (!shouldEval) return fence(...args);

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

    const html = fence(...args);
    const newHTML = html.replace(
      regexDIV,
      `$1 data-genji="dom" data-lang="${lang}" ${options}`
    );
    return newHTML;
  };
}
