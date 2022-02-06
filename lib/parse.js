const md = require("markdown-it")();
const path = require("path");
const fs = require("fs");

function parse(config) {
  const { outline, input, output, ...rest } = config;
  const forest = object2forest(outline);
  const modules = [];
  for (const tree of forest) {
    bfs(tree, (node) => {
      if (node.children) return;
      const { file, fileId } = node.data;
      const filepath = path.resolve(input, file + ".md");
      if (fs.existsSync(filepath)) {
        const markdown = fs.readFileSync(filepath, { encoding: "utf-8" });
        const tokens = md.parse(markdown);
        modules.push({
          id: fileId,
          blocks: parseTokens(tokens),
        });
      }
    });
  }
  return { outline: forest, modules, ...rest };
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
  let first = false;
  for (const [key, value] of Object.entries(o)) {
    tree.push(node(key, value));
  }

  function node(key, value) {
    const id = fileId(key);
    if (typeof value === "string") {
      const finalId = first ? id : "";
      if (!first) first = true;
      return { data: { name: key, file: value, id: finalId, fileId: finalId } };
    }
    const n = { data: { name: key, id, file: null }, children: [] };
    for (const [key, v] of Object.entries(value)) {
      n.children.push(node(key, v));
    }
    return n;
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

function fileId(name) {
  return name.toLowerCase().replace(/\s/g, "-");
}

module.exports = parse;
