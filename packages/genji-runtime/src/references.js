import { ancestor } from "acorn-walk";

function isFunction(node) {
  return (
    node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression"
  );
}

function isBlockScope(node) {
  return (
    isFunction(node) ||
    node.type === "Program" ||
    node.type === "BlockStatement" ||
    node.type === "StaticBlock" ||
    node.type === "SwitchStatement" ||
    node.type === "ForStatement" ||
    node.type === "ForInStatement" ||
    node.type === "ForOfStatement"
  );
}

function isFunctionScope(node) {
  return isFunction(node) || node.type === "Program";
}

// Collects the names bound by a pattern, e.g. const { a, b: [c, ...d] = e } = f.
function namesOfPattern(pattern, names = []) {
  if (!pattern) return names;
  switch (pattern.type) {
    case "Identifier":
      names.push(pattern.name);
      break;
    case "ObjectPattern":
      for (const property of pattern.properties) {
        namesOfPattern(property.type === "RestElement" ? property.argument : property.value, names);
      }
      break;
    case "ArrayPattern":
      for (const element of pattern.elements) namesOfPattern(element, names);
      break;
    case "RestElement":
      namesOfPattern(pattern.argument, names);
      break;
    case "AssignmentPattern":
      namesOfPattern(pattern.left, names);
      break;
  }
  return names;
}

// Finds the nearest enclosing scope, skipping the node itself (the last ancestor).
function closest(ancestors, predicate) {
  for (let i = ancestors.length - 2; i >= 0; i--) {
    if (predicate(ancestors[i])) return ancestors[i];
  }
}

function declarationsOf(ast) {
  const scopes = new Map();

  const declare = (scope, names) => {
    if (!scopes.has(scope)) scopes.set(scope, new Set());
    for (const name of names) scopes.get(scope).add(name);
  };

  const declareFunction = (node) => {
    const names = node.params.flatMap((d) => namesOfPattern(d));
    if (node.type !== "ArrowFunctionExpression") names.push("arguments");
    declare(node, names);
  };

  ancestor(ast, {
    VariableDeclaration(node, _, ancestors) {
      const scope = closest(ancestors, node.kind === "var" ? isFunctionScope : isBlockScope);
      declare(
        scope,
        node.declarations.flatMap((d) => namesOfPattern(d.id)),
      );
    },
    FunctionDeclaration(node, _, ancestors) {
      if (node.id) declare(closest(ancestors, isBlockScope), [node.id.name]);
      declareFunction(node);
    },
    FunctionExpression(node) {
      // A named function expression can refer to itself by name.
      if (node.id) declare(node, [node.id.name]);
      declareFunction(node);
    },
    ArrowFunctionExpression(node) {
      declareFunction(node);
    },
    ClassDeclaration(node, _, ancestors) {
      if (node.id) declare(closest(ancestors, isBlockScope), [node.id.name]);
    },
    ClassExpression(node) {
      if (node.id) declare(node, [node.id.name]);
    },
    CatchClause(node) {
      if (node.param) declare(node, namesOfPattern(node.param));
    },
  });

  return scopes;
}

// Returns the names a program reads but does not declare itself, in order of
// first appearance. Object keys, member properties, labels and assignment
// targets are not references, because acorn-walk never visits them as
// identifiers.
export function findReferences(ast) {
  const scopes = declarationsOf(ast);
  const references = new Set();

  const isLocal = (name, ancestors) => {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      if (scopes.get(ancestors[i])?.has(name)) return true;
    }
    return false;
  };

  ancestor(ast, {
    Identifier(node, _, ancestors) {
      if (!isLocal(node.name, ancestors)) references.add(node.name);
    },
  });

  return Array.from(references);
}
