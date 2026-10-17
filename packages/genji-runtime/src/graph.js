import Signal from "./signal.js";
import { parseVariable } from "./parse.js";

export const SCRIPT_PREFIX = "cell";

function lines(...L) {
  return L.join(`\n`);
}

// Adds an edge n1 -> n2 for every cell n2 that reads the variable declared by n1.
export function createGraph(nodes) {
  const relationById = new Map(nodes.map((n) => [n.id, { from: [], to: [] }]));
  for (const n2 of nodes) {
    for (const n1 of nodes) {
      if (n1 === n2 || n1.name === undefined || !n2.deps.includes(n1.name)) continue;
      relationById.get(n1.id).to.push(n2.id);
      relationById.get(n2.id).from.push(n1.id);
    }
  }
  return relationById;
}

// Returns the ids reachable from the given ids by following edges.
function reachableFrom(relationById, ids) {
  const reached = new Set();
  const stack = [...ids];
  while (stack.length) {
    for (const to of relationById.get(stack.pop()).to) {
      if (reached.has(to)) continue;
      reached.add(to);
      stack.push(to);
    }
  }
  return reached;
}

// Returns the ids of the cells in a cycle of any length, and of every cell
// downstream of one, since neither can ever run.
function blockedOf(relationById) {
  const ids = Array.from(relationById.keys());
  const circular = ids.filter((id) => reachableFrom(relationById, [id]).has(id));
  return reachableFrom(relationById, circular);
}

function execute(id, nodeById, relationById, valueById, countById, disposeById, idByName, hooks) {
  const { loading, success: _success, error } = hooks;

  const node = nodeById.get(id);

  const { expression, name } = node;

  if (name !== undefined && idByName.get(name) !== id) {
    error(new SyntaxError(`Identifier ${name} has already been declared.`), node);
    return;
  }

  const relation = relationById.get(id);
  const { from, to } = relation;
  const names = from.map((id) => nodeById.get(id).name);
  const deps = from.map((id) => valueById.get(id));

  const executeDeps = () => {
    for (const toId of to) {
      const count = countById.get(toId);
      if (count - 1 <= 0) {
        countById.set(toId, 0);
        execute(toId, nodeById, relationById, valueById, countById, disposeById, idByName, hooks);
      } else {
        countById.set(toId, count - 1);
      }
    }
  };

  const next = (values) => {
    let dispose = () => {};
    const unsubscribe = (callback) => (dispose = callback);

    let output;
    try {
      const e = expression === "" ? "undefined" : expression;
      output = new Function(
        "unsubscribe",
        ...names,
        lines(`const value = ${e}`, `return value //# sourceURL=${SCRIPT_PREFIX}-${id}.js`),
      )(unsubscribe, ...values);
    } catch (e) {
      error(e, node);
      return;
    }

    const success = (node) => _success(node, { names, values, value: valueById.get(id) });

    if (output instanceof Signal) {
      try {
        let resolved = false;

        // Make sure next is called after view is called.
        const next = (value) => {
          setTimeout(() => {
            // If a node is mounted, there is new need to update the node.
            if (resolved) {
              setTimeout(() => {
                valueById.set(id, value);
                executeDeps();
              }, 0);
            } else {
              valueById.set(id, value);
              executeDeps();
              success(node);
            }
          }, 0);
        };

        const view = (value) => {
          resolved = true;
          valueById.set(id, value);
          success(node);
        };

        const subscription = output.subscribe(next, view);

        const prevDispose = disposeById.get(id);
        prevDispose && prevDispose();

        dispose = () => subscription.unsubscribe();
        disposeById.set(id, dispose);
      } catch (e) {
        error(e, node);
        return;
      }
    } else {
      if (output instanceof Promise) loading(node);

      const promise = Promise.resolve(output).then((value) => {
        const prevDispose = disposeById.get(id);
        prevDispose && prevDispose();

        valueById.set(id, value);
        disposeById.set(id, dispose);
        return value;
      });

      // Report the cell apart from the stored promise: a rejection should reach
      // dependents, but an error while rendering the value should not.
      promise.then(() => success(node)).catch((e) => error(e, node));

      valueById.set(id, promise);
      executeDeps();
    }
  };

  if (deps.some((d) => d instanceof Promise)) {
    loading(node);
    Promise.all(deps)
      .then(
        (values) => next(values),
        (e) => {
          error(e, node);
          // Pass the error on, so dependents further down report it too.
          const failed = Promise.reject(e);
          failed.catch(() => {});
          valueById.set(id, failed);
          executeDeps();
        },
      )
      .catch((e) => error(e, node));
  } else {
    next(deps);
  }
}

// Runs the variables in dependency order and reports each cell through the
// hooks: loading(node), success(node, { names, values, value }) and
// error(error, node). Disposers of signals and unsubscribe callbacks are
// stored in disposeById. Returns the dependency graph.
export function run(variables, { disposeById = new Map(), loading = () => {}, success = () => {}, error = () => {} }) {
  const relationById = createGraph(variables);
  const nodeById = new Map(variables.map((d) => [d.id, d]));
  const valueById = new Map(variables.map((d) => [d.id, undefined]));
  const countById = new Map(variables.map((d) => [d.id, relationById.get(d.id).from.length]));
  const idByName = new Map();
  for (const { name, id } of variables) {
    if (!idByName.has(name) && name !== undefined) idByName.set(name, id);
  }

  const blocked = blockedOf(relationById);
  for (const { id } of variables) {
    if (!blocked.has(id)) continue;
    error(new SyntaxError(`Circular dependency detected.`), nodeById.get(id));
    // Never run, even when a dependency outside the cycle updates.
    countById.set(id, Infinity);
  }

  for (const { id } of variables) {
    if (blocked.has(id) || relationById.get(id).from.length) continue;
    execute(id, nodeById, relationById, valueById, countById, disposeById, idByName, {
      loading,
      success,
      error,
    });
  }

  return relationById;
}

// Adds the built-in width, now and dark signals unless a cell declares them.
export function builtinVariable(variables, { isDark } = {}) {
  const builtins = [
    ["width", "width = Signals.width()"],
    ["now", "now = Signals.now()"],
    ["dark", `dark = Signals.dark(${isDark})`],
  ];
  const names = new Set(variables.map((d) => d.name));
  let id = -1;
  for (const [name, code] of builtins) {
    if (names.has(name)) continue;
    const variable = {
      code,
      id: id--,
      options: {},
      ...parseVariable(code),
    };
    variables.push(variable);
  }
  return variables;
}
