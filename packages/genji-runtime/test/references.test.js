import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "acorn";
import { findReferences } from "../src/references.js";

function references(code) {
  return findReferences(parse(code, { ecmaVersion: "latest", sourceType: "script" }));
}

test("finds free variables in expressions", () => {
  assert.deepEqual(references("x + y * 2"), ["x", "y"]);
  assert.deepEqual(references("sum = a + b"), ["a", "b"]);
  assert.deepEqual(references("const total = price * count"), ["price", "count"]);
});

test("ignores the declared name of the cell", () => {
  assert.deepEqual(references("const a = 1"), []);
  assert.deepEqual(references("a = 1"), []);
  assert.deepEqual(references("function add(a, b = 10) { return a + b; }"), []);
});

test("ignores local variables in function bodies", () => {
  assert.deepEqual(references("function f() { const x = 1; return x; }"), []);
  assert.deepEqual(references("f = () => { let x = 1; x += y; return x; }"), ["y"]);
  assert.deepEqual(references("f = function () { var x; if (c) { x = 1; } return x; }"), ["c"]);
});

test("ignores function parameters, including destructured ones", () => {
  assert.deepEqual(references("f = (a, b) => a + b"), []);
  assert.deepEqual(references("f = ({ x }, [y, ...z]) => x + y + z.length + w"), ["w"]);
  assert.deepEqual(references("f = ({ a: { b } } = {}) => b"), []);
  assert.deepEqual(references("f = (a = x) => a"), ["x"]);
});

test("ignores object keys and member properties", () => {
  assert.deepEqual(references("({ x: 1, [y]: 2 })"), ["y"]);
  assert.deepEqual(references("({ x })"), ["x"]);
  assert.deepEqual(references("obj.x + obj?.y + obj[z]"), ["obj", "z"]);
  assert.deepEqual(references("class A { x = 1; y() { return this.x; } }"), []);
});

test("respects block scoping", () => {
  assert.deepEqual(references("{ let x = 1; } x"), ["x"]);
  assert.deepEqual(references("for (let i = 0; i < n; i++) {} i"), ["n", "i"]);
  assert.deepEqual(references("try {} catch ({ message }) { message }"), []);
});

test("resolves hoisted declarations", () => {
  assert.deepEqual(references("f = () => { g(); function g() {} }"), []);
  assert.deepEqual(references("f = () => { x = 1; var x; }"), []);
  assert.deepEqual(references("f = function () { return arguments.length; }"), []);
  assert.deepEqual(references("f = () => arguments"), ["arguments"]);
});

test("named function and class expressions can refer to themselves", () => {
  assert.deepEqual(references("f = function g() { return g; }"), []);
  assert.deepEqual(references("C = class D { static make() { return new D(); } }"), []);
});

test("ignores labels", () => {
  assert.deepEqual(references("outer: for (const a of list) { break outer; }"), ["list"]);
});
