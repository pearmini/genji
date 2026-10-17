import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import Signal from "../src/signal.js";
import { run, builtinVariable } from "../src/graph.js";
import { parseVariable } from "../src/parse.js";

// The hooks' calls of every run in the current test.
const runs = [];

// Cells read page globals, such as Signal, from globalThis.
before(() => (globalThis.Signal = Signal));

after(() => delete globalThis.Signal);

afterEach(() => {
  for (const { disposeById } of runs.splice(0)) {
    for (const dispose of disposeById.values()) dispose();
  }
  delete globalThis.log;
  delete globalThis.emit;
});

function variables(codes) {
  return codes.map((code, id) => ({ id, ...parseVariable(code) }));
}

// Runs the cells and records every hook call as [hook, id, value or message].
function runCells(...codes) {
  const events = [];
  const disposeById = new Map();
  const graph = run(variables(codes), {
    disposeById,
    loading: ({ id }) => events.push(["loading", id]),
    success: ({ id }, { value }) => events.push(["success", id, value]),
    error: (e, { id }) => events.push(["error", id, e.message]),
  });
  const valuesOf = (id) => events.filter(([hook, i]) => hook === "success" && i === id).map((d) => d[2]);
  // Dependents of non-signal cells briefly show loading, so most tests skip it.
  const results = () => events.filter(([hook]) => hook !== "loading");
  runs.push({ events, disposeById });
  return { events, disposeById, graph, valuesOf, results };
}

// Cells report success asynchronously and signals emit after timeouts, so wait
// until no hook has been called for a few macrotasks.
async function settle() {
  const count = () => runs.reduce((sum, d) => sum + d.events.length, 0);
  for (let quiet = 0, last = count(), i = 0; quiet < 3 && i < 100; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const current = count();
    quiet = current === last ? quiet + 1 : 0;
    last = current;
  }
}

test("runs independent cells", async () => {
  const { events, results } = runCells("a = 1", "const b = 'b'", "function c() { return 3; }", "1 + 2");
  assert.deepEqual(events, []);
  await settle();
  assert.deepEqual(results().slice(0, 2), [
    ["success", 0, 1],
    ["success", 1, "b"],
  ]);
  assert.equal(typeof results()[2][2], "function");
  assert.deepEqual(results()[3], ["success", 3, 3]);
});

test("runs cells after the cells they depend on", async () => {
  const { results } = runCells("c = b * 10", "b = a + 1", "a = 1");
  await settle();
  assert.deepEqual(results(), [
    ["success", 2, 1],
    ["success", 1, 2],
    ["success", 0, 20],
  ]);
});

test("runs a cell once after all of its dependencies", async () => {
  const { valuesOf } = runCells("a = 1", "b = a + 1", "c = a * 3", "d = b + c");
  await settle();
  assert.deepEqual(valuesOf(3), [5]);
});

test("unnamed cells can read named cells", async () => {
  const { valuesOf } = runCells("a = 2", "a * 10");
  await settle();
  assert.deepEqual(valuesOf(1), [20]);
});

test("builds edges from the cells' references", () => {
  const { graph } = runCells("a = 1", "b = a + 1", "f = (a) => a", "g = () => { const a = 0; return a; }");
  assert.deepEqual(graph.get(0), { from: [], to: [1] });
  assert.deepEqual(graph.get(1), { from: [0], to: [] });
  assert.deepEqual(graph.get(2), { from: [], to: [] });
  assert.deepEqual(graph.get(3), { from: [], to: [] });
});

test("waits for promises before running dependents", async () => {
  const { events, valuesOf } = runCells("a = Promise.resolve(1)", "b = a + 1");
  assert.deepEqual(events, [
    ["loading", 0],
    ["loading", 1],
  ]);
  await settle();
  assert.deepEqual(valuesOf(0), [1]);
  assert.deepEqual(valuesOf(1), [2]);
});

test("reports a rejected promise to the cell and all of its dependents", async () => {
  const { results } = runCells("a = Promise.reject(new Error('boom'))", "b = a + 1", "c = b + 1");
  await settle();
  assert.deepEqual(results(), [
    ["error", 0, "boom"],
    ["error", 1, "boom"],
    ["error", 2, "boom"],
  ]);
});

test("reports a rendering error only on the rendered cell", async () => {
  const events = [];
  runs.push({ events, disposeById: new Map() });
  run(variables(["a = 1", "b = a + 1"]), {
    success: ({ id }, { value }) => {
      if (id === 0) throw new Error("render failed");
      events.push(["success", id, value]);
    },
    error: (e, { id }) => events.push(["error", id, e.message]),
  });
  await settle();
  assert.deepEqual(events, [
    ["error", 0, "render failed"],
    ["success", 1, 2],
  ]);
});

test("doesn't run dependents of a cell that throws", () => {
  const { events } = runCells("a = (() => { throw new Error('boom'); })()", "b = a + 1");
  assert.deepEqual(events, [["error", 0, "boom"]]);
});

test("reruns dependents when a signal emits", async () => {
  const { valuesOf } = runCells(
    "a = new Signal((next) => { globalThis.emit = next; next(1); })",
    "b = a * 2",
    "c = b + 1",
  );
  await settle();
  assert.deepEqual(valuesOf(1), [2]);
  assert.deepEqual(valuesOf(2), [3]);

  globalThis.emit(5);
  await settle();
  assert.deepEqual(valuesOf(0), [1, 5]);
  assert.deepEqual(valuesOf(1), [2, 10]);
  assert.deepEqual(valuesOf(2), [3, 11]);
});

test("disposes signals and unsubscribe callbacks", async () => {
  globalThis.log = [];
  const { disposeById } = runCells(
    "a = new Signal((next) => { globalThis.emit = next; next(1); return () => log.push('signal'); })",
    "b = (unsubscribe(() => log.push('b' + a)), a)",
  );
  await settle();
  assert.deepEqual(globalThis.log, []);

  // Rerunning b disposes its previous run.
  globalThis.emit(2);
  await settle();
  assert.deepEqual(globalThis.log, ["b1"]);

  for (const dispose of disposeById.values()) dispose();
  assert.deepEqual(globalThis.log, ["b1", "signal", "b2"]);
});

test("reports circular dependencies", () => {
  const { events } = runCells("a = b + 1", "b = a + 1");
  assert.deepEqual(events, [
    ["error", 0, "Circular dependency detected."],
    ["error", 1, "Circular dependency detected."],
  ]);
});

// Known bugs in cycle detection, which only looks at cycles of two cells.
test("reports cycles of more than two cells", { todo: true }, async () => {
  const { results } = runCells("a = c + 1", "b = a + 1", "c = b + 1");
  await settle();
  assert.equal(results().length, 3);
});

test("doesn't run dependents of a circular dependency", { todo: true }, async () => {
  const { valuesOf } = runCells("a = b + 1", "b = a + 1", "c = a * 2");
  await settle();
  assert.deepEqual(valuesOf(2), []);
});

test("reports duplicate declarations", async () => {
  const { results } = runCells("a = 1", "a = 2");
  await settle();
  assert.deepEqual(results(), [
    ["error", 1, "Identifier a has already been declared."],
    ["success", 0, 1],
  ]);
});

test("adds built-in signals unless a cell declares them", () => {
  const builtins = (codes) => builtinVariable(variables(codes)).map(({ id, name }) => [id, name]);
  assert.deepEqual(builtins(["x = 1"]), [
    [0, "x"],
    [-1, "width"],
    [-2, "now"],
    [-3, "dark"],
  ]);
  assert.deepEqual(builtins(["width = 100", "const dark = true"]), [
    [0, "width"],
    [1, "dark"],
    [-1, "now"],
  ]);
});
