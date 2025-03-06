export function parseMeta(meta) {
  const metaTokens = meta
    .split(" ")
    .filter((d) => d !== "")
    .filter((d) => !d.startsWith("[") && !d.endsWith("]")); // Ignore [name.js] for code group.
  if (!metaTokens.length) return null;
  const valueTokens = metaTokens.map((d) => d.split("="));
  const shouldEval = valueTokens.find(([k, v]) => k === "eval" && (v === "true" || v === undefined));
  if (!shouldEval) return null;
  return Object.fromEntries(valueTokens);
}
