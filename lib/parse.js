function parse(config) {
  const { outline, ...rest } = config;
  const forest = object2forest(outline);
  return { outline: forest, first: first(forest).data.id, ...rest };
}

function object2forest(o) {
  const tree = [];
  for (const [key, value] of Object.entries(o)) {
    tree.push(node(key, value));
  }
  return tree;
}

function node(key, value) {
  const id = fileId(key);
  const data = { name: key, id, file: null };
  if (typeof value === "string") {
    return { data: { ...data, file: value, fileId: id } };
  }
  const n = { data, children: [] };
  for (const [key, v] of Object.entries(value)) {
    n.children.push(node(key, v));
  }
  return n;
}

function first(node) {
  if (Array.isArray(node)) return first(node[0]);
  if (!node.children || node.children.length === 0) return node;
  return first(node.children[0]);
}

function fileId(name) {
  return name.toLowerCase().replace(/\s/g, "-");
}

module.exports = parse;
