const md = require("markdown-it")();
const path = require("path");
const fs = require("fs");

function parse(config) {
  const { outline, title, input } = config;
  const forest = object2forest(outline);
  const modules = [];
  for (const tree of forest) {
    bfs(tree, (node) => {
      if (node.children) return;
      const { file } = node.data;
      const filepath = path.resolve(input, file + ".md");
      const markdown = fs.readFileSync(filepath, { encoding: "utf-8" });
      const tokens = md.parse(markdown);
      modules.push({
        id: file,
        blocks: parseTokens(tokens),
      });
    });
  }
  return { title, outline: forest, modules };
}

function parseTokens(tokens) {
  const blocks = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const { type, tag } = t;
    if (type === "heading_open") {
      blocks.push({
        type: tag,
        content: tokens[i + 1].content,
      });
    } else if (type === "fence") {
      blocks.push({
        type: "code",
        content: t.content,
      });
    }
  }
  return blocks;
}

function object2forest(o) {
  const tree = [];
  for (const [key, value] of Object.entries(o)) {
    tree.push(node(key, value));
  }
  return tree;
}

function bfs(root, callback) {
  const discoverd = [root];
  while (discoverd.length) {
    const node = discoverd.pop();
    callback(node);
    discoverd.push(...(node.children || []));
  }
}

function node(key, value) {
  if (typeof value === "string") {
    return { data: { name: key, file: value } };
  }
  const n = { data: { name: key }, children: [] };
  for (const [key, v] of Object.entries(value)) {
    n.children.push(node(key, v));
  }
  return n;
}

module.exports = parse;
