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
        modules.push({
          id: fileId,
          markdown,
        });
      }
    });
  }
  return { outline: forest, modules, ...rest };
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
