const regexDIV = /(<div class="[^"]*")/;

export function attrs(md) {
  const fence = md.renderer.rules.fence;
  if (!fence) return;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const { info } = token;

    const infoTokens = info.split(" ").filter((d) => d !== "");
    if (!infoTokens.length) return fence(...args);

    const valueTokens = infoTokens.map((d) => d.split("="));
    const shouldEval = valueTokens.find(([k, v]) => k === "eval" && (v === "true" || v === undefined));
    if (!shouldEval) return fence(...args);

    // Language.
    const lang = info.split(" ")[0];

    // Options
    const options = valueTokens.map((d) => `data-${d[0]}="${d[1]}"`).join(" ");

    const html = fence(...args);
    const newHTML = html.replace(regexDIV, `$1 data-genji="dom" data-lang="${lang}" ${options}`);
    return newHTML;
  };
}
