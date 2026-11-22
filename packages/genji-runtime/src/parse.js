import { parse } from "acorn";
import { findReferences } from "./references.js";

// Returns the name a cell declares (if any) and the code that computes its value.
function normalizeVariable(ast, code, tokens) {
  const [node] = ast.body;

  // The value is everything after the = that follows the name. Acorn's range of
  // the initializer excludes grouping parentheses, so slice from the = token.
  const valueAfter = (name) => {
    const equal = tokens.find((d) => d.type.label === "=" && d.start >= name.end);
    return code.slice(equal.end).trim();
  };

  // x = 1
  if (node?.type === "ExpressionStatement") {
    const { expression: e } = node;
    if (e.type === "AssignmentExpression" && e.operator === "=" && e.left.type === "Identifier") {
      return [e.left.name, valueAfter(e.left)];
    }
    return [undefined, code];
  }

  // const x = 1
  if (node?.type === "VariableDeclaration") {
    const [{ id, init }] = node.declarations;
    return [id.name, init ? valueAfter(id) : ""];
  }

  // function x() {}
  if (node?.type === "FunctionDeclaration") return [node.id.name, code];

  return [undefined, ""];
}

export function parseVariable(code) {
  const tokens = [];
  const ast = parse(code, { ecmaVersion: "latest", sourceType: "script", onToken: tokens });
  const [name, expression] = normalizeVariable(ast, code, tokens);
  return { name, expression, deps: findReferences(ast) };
}

// The source of a code block's <pre>. Docusaurus 3 draws each line as an element (.token-line) that ends
// in <br>, which textContent drops, so the lines are joined by hand.
export function codeOf(pre) {
  const lines = pre.querySelectorAll(".token-line");
  return lines.length ? Array.from(lines, (line) => line.textContent).join("\n") : pre.textContent;
}
