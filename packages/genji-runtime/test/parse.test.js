import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVariable } from "../src/parse.js";

function variable(code) {
  const { name, expression } = parseVariable(code);
  return [name, expression];
}

test("names assignment cells", () => {
  assert.deepEqual(variable("x = 1"), ["x", "1"]);
  assert.deepEqual(variable("// a = b\nx = 1"), ["x", "1"]);
  assert.deepEqual(variable("x += 1"), [undefined, "x += 1"]);
  assert.deepEqual(variable("obj.x = 1"), [undefined, "obj.x = 1"]);
});

test("names declaration cells", () => {
  assert.deepEqual(variable("const x = 1"), ["x", "1"]);
  assert.deepEqual(variable("let x;"), ["x", ""]);
  assert.deepEqual(variable("const { a } = obj"), [undefined, "obj"]);
  assert.deepEqual(variable("const { a = 1 } = obj"), [undefined, "obj"]);
});

test("names function declaration cells", () => {
  const code = "function add(a, b = 1) { return a + b; }";
  assert.deepEqual(variable(code), ["add", code]);
});

test("leaves expression cells unnamed", () => {
  assert.deepEqual(variable("add(1, 2)"), [undefined, "add(1, 2)"]);
  assert.deepEqual(variable("x * 2"), [undefined, "x * 2"]);
});

test("keeps grouping parentheses in values", () => {
  assert.deepEqual(variable("x = (1 + 2);"), ["x", "(1 + 2);"]);
  assert.deepEqual(variable("const x = (1 + 2);"), ["x", "(1 + 2);"]);
  assert.deepEqual(variable("x = (a, b);"), ["x", "(a, b);"]);
  assert.deepEqual(variable("const x = /* = */ (1)"), ["x", "/* = */ (1)"]);
});

test("keeps trailing statements and declarators in values", () => {
  assert.deepEqual(variable("const x = 1;\nx * 2"), ["x", "1;\nx * 2"]);
  assert.deepEqual(variable("const a = 1, b = 2"), ["a", "1, b = 2"]);
});

test("values are valid expressions", () => {
  for (const code of ["x = (1 + 2);", "const x = (a, b);", "const x = (1) + (2)"]) {
    const { expression } = parseVariable(code);
    assert.doesNotThrow(() => new Function(`const value = ${expression}`));
  }
});
